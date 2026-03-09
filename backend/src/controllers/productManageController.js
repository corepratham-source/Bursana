const streamifier = require("streamifier");
const { pool } = require("../utils/db");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");

// ========================== GET SUPPLIER PRODUCTS ==========================
exports.getSupplierProducts = async (req, res) => {
  try {
    const supplierId = req.user.id;

    const result = await pool.query(
      `
      SELECT id, name, price, description, images, active
      FROM products
      WHERE supplier_id = $1
      ORDER BY created_at DESC
      `,
      [supplierId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch supplier products failed:", err);
    res.status(500).json({ error: "Failed to load products" });
  }
};


// ========================== UPDATE PRODUCT ==========================
exports.updateProduct = async (req, res) => {
  try {
    const supplierId = req.user.id;
    const { productId } = req.params;
    const { name, description, price } = req.body;

    await pool.query(
      `
      UPDATE products
      SET name = $1, description = $2, price = $3
      WHERE id = $4 AND supplier_id = $5
      `,
      [name, description, price, productId, supplierId]
    );

    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    console.error("Update product failed:", err);
    res.status(500).json({ error: "Update failed" });
  }
};


// ========================== DELETE PRODUCT ==========================
exports.deleteProduct = async (req, res) => {
  try {
    const supplierId = req.user.id;
    const { productId } = req.params;

    await pool.query(
      `
      DELETE FROM products
      WHERE id = $1 AND supplier_id = $2
      `,
      [productId, supplierId]
    );

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete product failed:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

exports.addProductImages = async (req, res) => {
  try {
    const supplierId = req.user.id;
    const { productId } = req.params;

    if (!req.files || !req.files.length) {
      return res.status(400).json({ error: "No images uploaded" });
    }
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
    const result = await pool.query(
      `
      UPDATE products
      SET images = images || $1
      WHERE id = $2 AND supplier_id = $3
      RETURNING images
      `,
      [imageUrls, productId, supplierId]
    );

    res.json({ images: result.rows[0].images });
  } catch (err) {
    console.error("Add images failed:", err);
    res.status(500).json({ error: "Failed to add images" });
  }
};

exports.removeProductImage = async (req, res) => {
  try {
    const supplierId = req.user.id;
    const { productId } = req.params;
    const { image } = req.body;

    const result = await pool.query(
      `
      SELECT images
      FROM products
      WHERE id = $1 AND supplier_id = $2
      `,
      [productId, supplierId]
    );

    const images = result.rows[0]?.images || [];
    const updated = images.filter(img => img !== image);

    await pool.query(
      `
      UPDATE products
      SET images = $1
      WHERE id = $2 AND supplier_id = $3
      `,
      [updated, productId, supplierId]
    );

    // delete file from disk
    const filePath = `./uploads/${image}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ images: updated });
  } catch (err) {
    console.error("Remove image failed:", err);
    res.status(500).json({ error: "Failed to remove image" });
  }
};

