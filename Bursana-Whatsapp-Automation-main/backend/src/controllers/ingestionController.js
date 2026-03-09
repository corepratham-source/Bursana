const { pool } = require("../utils/db");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const { preprocessImage } = require("../controllers/imagePreprocessController");

// ================== IMAGE UPLOAD ==================
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images received" });
    }

    const supplier_id = req.user.id;
    let stagingId = req.body.stagingId || null;

    // 1️⃣ Upload all images to Cloudinary
    const uploadPromises = req.files.map(file =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products",
            strip_metadata: true
           },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      })
    );

    const imageUrls = await Promise.all(uploadPromises);

    // 2️⃣ Create or update staging row
    if (!stagingId) {
      const result = await pool.query(
        `
        INSERT INTO staging_products (images, supplier_id)
        VALUES ($1, $2)
        RETURNING id
        `,
        [imageUrls, supplier_id]
      );
      stagingId = result.rows[0].id;
    } else {
      await pool.query(
        `
        UPDATE staging_products
        SET images = images || $1
        WHERE id = $2 AND supplier_id = $3
        `,
        [imageUrls, stagingId, supplier_id]
      );
    }

    res.json({ success: true, stagingId });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
};




// ================== DESCRIPTION PROCESS ==================
exports.processDescription = async (req, res) => {
  try {
    const { stagingId, description } = req.body;

    if (!stagingId || !description) {
      return res.status(400).json({ error: "Missing stagingId or description" });
    }

    const lines = description.split("\n").map(l => l.trim()).filter(l => l);
    const name = lines[0] || "Unnamed Product";
    const truncatedDescription = lines.slice(1,-1).join("\n");
    const priceMatch = description.match(/₹\s?(\d+)|Rs\s?(\d+)/i);
    const price = priceMatch ? priceMatch[1] || priceMatch[2] : 499;

    await pool.query(
      `
      UPDATE staging_products
      SET description = $1, product_name = $2, price = $3
      WHERE id = $4
      `,
      [truncatedDescription, name, price, stagingId]
    );

    res.json({
      success: true,
      product_name: name,
      price
    });

  } catch (err) {
    console.error("Description processing failed:", err);
    res.status(500).json({ error: "Description processing failed" });
  }
};

function snapTo49or99(price) {
  const base = Math.floor(price / 100) * 100;

  const candidate49 = base + 49;
  const candidate99 = base + 99;
  const next49 = base + 149; // handles edge case near 99

  const candidates = [candidate49, candidate99, next49];

  return candidates.reduce((closest, current) =>
    Math.abs(current - price) < Math.abs(closest - price)
      ? current
      : closest
  );
}

// ================== FINALIZE PRODUCT ==================
exports.finalizeProduct = async (req, res) => {
  try {
    const { stagingId } = req.body;

    if (!stagingId) {
      return res.status(400).json({ error: "Missing stagingId" });
    }
    

    const result = await pool.query(
      `
      SELECT *
      FROM staging_products
      WHERE id = $1
      `,
      [stagingId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Staging entry not found" });
    }

    const staged = result.rows[0];
    const imageUrl = staged.images[0];
    const imagecategory = await preprocessImage(imageUrl);
    const cat = imagecategory.category;
    const basePrice = Number(staged.price) || 499;
    const SHIPPING_COST = 150;
    const markupPercent = 25 + Math.floor(basePrice / 500) * 10;
    const markupAmount = basePrice * (markupPercent / 100);
    const margin_price = markupAmount + SHIPPING_COST;
    const finalPrice = snapTo49or99(basePrice + margin_price);
    const newprod = await pool.query(
      `
      INSERT INTO products (
        supplier_id,
        images,
        description,
        price,
        name,
        category,
        margin,
        total_price
      )  
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, images, description, name, price, category, margin
      `,
      [
        staged.supplier_id,
        staged.images,
        staged.description,
        basePrice,
        staged.product_name,
        cat,
        margin_price,
        finalPrice
      ]
    );


    await pool.query(`DELETE FROM staging_products WHERE id = $1`, [stagingId]);

    res.json({ success: true, message: "Product finalized & saved" });
    const io = req.app.get("io");
    io.emit("newProduct",newprod.rows[0]);

  } catch (err) {
    console.error("Finalize failed:", err);
    res.status(500).json({ error: "Finalize failed" });
  }
};
