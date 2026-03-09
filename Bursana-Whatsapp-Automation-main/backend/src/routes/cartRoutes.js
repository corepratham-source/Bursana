const express = require("express");
const router = express.Router();
const { pool } = require("../utils/db");
const auth = require("../middleware/auth");

/**
 * GET CART
 */
router.get("/", auth(), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.images,
        p.price,
        p.description,
        p.name,
        p.margin,
        p.total_price,
        COUNT(*) AS quantity
      FROM users u
      JOIN unnest(u.cart) AS c(product_id) ON TRUE
      JOIN products p ON p.id = c.product_id
      WHERE u.id = $1
      GROUP BY p.id, p.images, p.price, p.description,p.margin,p.total_price
      ORDER BY p.id;
      `,
      [req.user.id]
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error("Fetch cart failed:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

/**
 * ADD TO CART
 */
router.post("/add", auth(), async (req, res) => {
  const { product_id } = req.body;
  try {
    await pool.query(
      `UPDATE users 
       SET cart = array_append(cart, $1) 
       WHERE id = $2`,
      [product_id, req.user.id]
    );
    const result = await pool.query(
      `SELECT 
        p.id,
        p.images,
        p.price,
        p.description,
        p.name,
        p.margin,
        COUNT(*) AS quantity
      FROM users u
      JOIN unnest(u.cart) AS c(product_id) ON TRUE
      JOIN products p ON p.id = c.product_id
      WHERE u.id = $1
      GROUP BY p.id, p.images, p.price, p.description
      ORDER BY p.id`,
      [req.user.id]
    );
    const io = req.app.get("io");
    io.to(`user_${req.user.id}`).emit("cartUpdated", result.rows);
    res.json({ success: true, message: "Added to cart" });
    
  } catch (err) {
    console.error("Add to cart failed:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

/**
 * REMOVE FROM CART
 */
router.post("/remove", auth(), async (req, res) => {
  const { product_id } = req.body;
  try {
    await pool.query(
      `UPDATE users 
       SET cart = array_remove(cart, $1) 
       WHERE id = $2`,
      [product_id, req.user.id]
    );

    res.json({ success: true, message: "Removed from cart" });
  } catch (err) {
    console.error("Remove cart failed:", err);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

router.post("/update", auth(), async (req, res) => {
  const { product_id, change } = req.body;
  const userId = req.user.id;

  // Add (+1)
  if (change === 1) {
    await pool.query(
      `UPDATE users SET cart = array_append(cart, $1) WHERE id = $2`,
      [product_id, userId]
    );
  }

  if (change === -1) {
    await pool.query(
      `UPDATE users
      SET cart = (
          SELECT ARRAY(
            SELECT x FROM unnest(cart) WITH ORDINALITY AS t(x, i)
            WHERE NOT (
              x = $1
              AND i = (
                SELECT MIN(i)
                FROM unnest(cart) WITH ORDINALITY AS t2(x2, i)
                WHERE x2 = $1
              )
            )
          )
      )
      WHERE id = $2`,
      [product_id, userId]
    );
  }

  const result = await pool.query(
      `SELECT 
        p.id,
        p.images,
        p.price,
        p.description,
        p.name,
        p.margin,
        COUNT(*) AS quantity
      FROM users u
      JOIN unnest(u.cart) AS c(product_id) ON TRUE
      JOIN products p ON p.id = c.product_id
      WHERE u.id = $1
      GROUP BY p.id, p.images, p.price, p.description
      ORDER BY p.id;
      `,
      [req.user.id]
    );
    res.json(result.rows || []);
});


module.exports = router;
