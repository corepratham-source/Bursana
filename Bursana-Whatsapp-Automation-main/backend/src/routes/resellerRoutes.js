const express = require("express");
const { pool } = require("../utils/db");
const router = express.Router();

// Add reseller
router.post("/", async (req, res) => {
  try {
    const { supplier_id, name, phone } = req.body;
    const result = await pool.query(
      "INSERT INTO resellers(supplier_id, name, phone) VALUES($1,$2,$3) RETURNING *",
      [supplier_id, name, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add reseller" });
  }
});

// Get supplier's resellers
router.get("/:supplier_id", async (req, res) => {
  try {
    const supplier_id = req.params.supplier_id;
    const result = await pool.query(
      "SELECT * FROM resellers WHERE supplier_id=$1",
      [supplier_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch resellers" });
  }
});

// Delete reseller
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("DELETE FROM resellers WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete reseller" });
  }
});

module.exports = router;
