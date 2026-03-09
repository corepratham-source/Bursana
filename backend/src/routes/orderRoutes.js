const express = require("express");
const Twilio = require("twilio");
const { pool } = require("../utils/db");
const auth = require("../middleware/auth");
const router = express.Router();

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/**
 * POST /orders
 * body: { product_id }
 */
router.post("/", auth, async (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: "product_id required" });
  }

  try {
    // 1️⃣ Fetch product + supplier
    const productResult = await pool.query(
      `
      SELECT 
        p.id AS product_id,
        p.price,
        p.total_price,
        s.id AS supplier_id,
        s.phone_number AS supplier_phone
      FROM products p
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = $1
      `,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productResult.rows[0];
    const customerId = req.user.id;
    // 2️⃣ Create order
    const orderResult = await pool.query(
      `
      INSERT INTO orders (customer_id)
      VALUES ($1)
      RETURNING id
      `,
      [customerId]
    );
    await pool.query(
        `
        INSERT INTO order_items (order_id, product_id, supplier_id, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [orderResult.rows[0].order_id, product.id, product.supplier_id, 1, product.total_price]
      );
    const order = orderResult.rows[0];
    // 3️⃣ Send WhatsApp message to supplier
    const message = `
    🛒 *New Order Received*

    • Order ID: ${order.order_id}
    • Product ID: ${product.product_id}`.trim();

    await twilioClient.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${product.supplier_phone}`,
      body: message,
    });

    // 4️⃣ Respond
    res.status(201).json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ error: "Order failed" });
  }
});

router.post("/cart", auth, async (req, res) => {
  const customerId = req.user.id;

  try {
    // 1️⃣ Fetch cart
    const userRes = await pool.query(
      `SELECT cart FROM users WHERE id = $1`,
      [customerId]
    );

    const cart = userRes.rows[0]?.cart;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    const quantityMap = {};
    for (const productId of cart) {
      quantityMap[productId] = (quantityMap[productId] || 0) + 1;
    }

    const productIds = Object.keys(quantityMap).map(Number);

    // 3️⃣ Fetch products + suppliers
    const productsRes = await pool.query(
      `
      SELECT 
        p.id,
        p.price,
        p.total_price,
        p.supplier_id,
        s.id AS supplier_id,
        s.phone_number
      FROM products p
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ANY($1)
      `,
      [productIds]
    );

    // 4️⃣ Create ONE grouped order
    const orderRes = await pool.query(
      `
      INSERT INTO orders (customer_id)
      VALUES ($1)
      RETURNING id
      `,
      [customerId]
    );

    const orderId = orderRes.rows[0].id;

    // 5️⃣ Group items by supplier
    const supplierMap = {};

    for (const p of productsRes.rows) {
      const quantity = quantityMap[p.id];

      if (!supplierMap[p.supplier_id]) {
        supplierMap[p.supplier_id] = {
          phone: p.phone_number,
          items: []
        };
      }

      supplierMap[p.supplier_id].items.push({
        product_id: p.id,
        quantity
      });

      // ✅ INSERT quantity correctly
      await pool.query(
        `
        INSERT INTO order_items (order_id, product_id, supplier_id, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [orderId, p.id, p.supplier_id, quantity, p.total_price]
      );
    }

    // 6️⃣ Notify suppliers (ONE message per supplier)
    for (const supplierId in supplierMap) {
      const { phone, items } = supplierMap[supplierId];

      let message = `🛒 *New Order Received*\nOrder ID: ${orderId}\n\n`;

      items.forEach(i => {
        message += `• Product ID: ${i.product_id} × ${i.quantity}\n`;
      });

      await twilioClient.messages.create({
        from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phone}`,
        body: message.trim()
      });
    }

    // 7️⃣ Clear cart
    await pool.query(
      `UPDATE users SET cart = '{}' WHERE id = $1`,
      [customerId]
    );

    res.status(201).json({
      success: true,
      order_id: orderId
    });

  } catch (err) {
    console.error("Cart order failed:", err);
    res.status(500).json({ error: "Cart order failed" });
  }
});


router.get("/customer-orders", auth, async (req, res) => {
  try {
    const customerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
      o.id AS order_id,
      o.status,
      o.created_at,
      json_agg(
        json_build_object(
          'product_id', p.id,
          'name', p.name,
          'price', oi.price,
          'image', p.images[1],
          'quantity', oi.quantity
        )
      ) AS products,
      SUM(oi.price*oi.quantity) AS total
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.customer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC;

      `,
      [customerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch customer orders failed:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


module.exports = router;
