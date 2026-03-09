const express = require("express");
const { pool } = require("../utils/db");
const router = express.Router();
const auth = require("../middleware/auth");

// ✅ GET WISHLIST - Get user's wishlist items
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `
      SELECT w.id, w.product_id, w.created_at,
             p.name, p.total_price, p.images, p.description
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch wishlist:", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// ✅ ADD TO WISHLIST
router.post("/add", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Check if already in wishlist
    const existing = await pool.query(
      "SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, product_id]
    );

    if (existing.rows.length > 0) {
      return res.json({ success: true, message: "Already in wishlist" });
    }

    // Add to wishlist
    await pool.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)",
      [userId, product_id]
    );

    res.json({ success: true, message: "Added to wishlist" });
  } catch (err) {
    console.error("Failed to add to wishlist:", err);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// ✅ REMOVE FROM WISHLIST
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await pool.query(
      "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (err) {
    console.error("Failed to remove from wishlist:", err);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

module.exports = router;
