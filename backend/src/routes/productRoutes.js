const express = require("express");
const { pool } = require("../utils/db");
const router = express.Router();

async function getMaxPriceForUser(userId) {
  if (!userId) return 100000;

  const { rows } = await pool.query(
    `
      SELECT max_clothing_price
      FROM user_preferences
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rows[0]?.max_clothing_price ?? 100000;
}

// ✅ GET ALL ACTIVE PRODUCTS
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    const maxPrice = await getMaxPriceForUser(userId);
    const result = await pool.query(
      `
      SELECT p.*, s.phone_number AS supplier_phone
      FROM products p
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.active = true
        AND p.total_price <= $1
      ORDER BY p.created_at DESC
    `,
      [maxPrice]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ GET DISTINCT CATEGORIES
router.get("/categories", async (req, res) => {
  try {
    const userId = req.user?.id;
    const maxPrice = await getMaxPriceForUser(userId);
    const result = await pool.query(
      `
      SELECT DISTINCT category
      FROM products
      WHERE active = true
        AND category IS NOT NULL
        AND total_price <= $1
      ORDER BY category
    `,
      [maxPrice]
    );

    res.json(result.rows.map((r) => r.category));
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

module.exports = router;
