const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../utils/db");
const { sendOtpEmail } = require("../utils/mailer");

/* ================= CONFIG ================= */

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production"? true : false,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === "production"? true : false,
};


/* ================= CUSTOMER REGISTRATION ================= */

exports.registration = async (req, res) => {
  try {
    let { phone, name, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE phone=$1",
      [phone]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (phone, name, password)
      VALUES ($1,$2,$3)
      RETURNING id, phone, name
      `,
      [phone, name || "", hashedPassword]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

/* ================= CUSTOMER LOGIN ================= */

exports.login = async (req, res) => {
  try {
    let { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE phone=$1",
      [phone]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);
    res.json({
      user: { id: user.id, phone: user.phone, name: user.name },
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

/* ================= SUPPLIER LOGIN ================= */

exports.supplierLogin = async (req, res) => {
  try {
    let { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const result = await pool.query(
      `SELECT * FROM suppliers WHERE phone_number=$1`,
      [phone]
    );

    // First-time supplier
    if (!result.rows.length) {
      return res.json({ firstTime: true });
    }

    const supplier = result.rows[0];

    const token = jwt.sign(
      { id: supplier.id, role: "supplier" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);
    res.json({
      firstTime: false,
      user: {
        id: supplier.id,
        phone: supplier.phone_number,
        role: "supplier",
      },
    });
  } catch (err) {
    console.error("Supplier login failed:", err);
    res.status(500).json({ error: "Supplier login failed" });
  }
};

/* ================= OTP HELPERS ================= */

const verifyOtp = async (phone, otp) => {
  const result = await pool.query(
    `
    SELECT * FROM otps
    WHERE phone=$1 AND otp=$2 AND verified=false
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [phone, otp]
  );

  return result.rows[0] || null;
};

/* ================= SUPPLIER REGISTER ================= */

exports.supplierRegister = async (req, res) => {
  try {
    let { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP required" });
    }

    const record = await verifyOtp(phone, otp);

    if (!record) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ error: "Too many OTP attempts" });
    }

    if (new Date() > record.expires_at) {
      return res.status(400).json({ error: "OTP expired" });
    }

    await pool.query(
      `UPDATE otps SET verified=true, attempts=attempts+1 WHERE id=$1`,
      [record.id]
    );

    const existing = await pool.query(
      `SELECT id FROM suppliers WHERE phone_number=$1`,
      [phone]
    );

    if (existing.rows.length) {
      return res.status(400).json({ error: "Supplier already registered" });
    }

    const insert = await pool.query(
      `INSERT INTO suppliers (phone_number) VALUES ($1) RETURNING id`,
      [phone]
    );

    const token = jwt.sign(
      { id: insert.rows[0].id, role: "supplier" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);
    res.json({
      user: {
        id: insert.rows[0].id,
        phone,
        role: "supplier",
        isNew: true,
      },
    });
  } catch (err) {
    console.error("Supplier register failed:", err);
    res.status(500).json({ error: "Supplier registration failed" });
  }
};

/* ================= REQUEST OTP ================= */

exports.requestOtp = async (req, res) => {
  let { email } = req.body;
  let { phone } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await pool.query(
    `INSERT INTO otps (phone, otp, expires_at) VALUES ($1,$2,$3)`,
    [phone, otp, expiresAt]
  );

  if (process.env.NODE_ENV !== "production") {
    console.log(`OTP for ${phone}: ${otp}`);
  }

  await sendOtpEmail({ to: email, otp });

  res.json({ success: true });
};

/* ================= OTP VERIFY + CUSTOMER REGISTER ================= */

exports.verifyOtpAndRegister = async (req, res) => {
  try {
    let { phone, otp, name, password } = req.body;


    if (!phone || !otp || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const record = await verifyOtp(phone, otp);

    if (!record) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ error: "Too many OTP attempts" });
    }

    if (new Date() > record.expires_at) {
      return res.status(400).json({ error: "OTP expired" });
    }

    await pool.query(
      `UPDATE otps SET verified=true, attempts=attempts+1 WHERE id=$1`,
      [record.id]
    );

    const existing = await pool.query(
      `SELECT id FROM users WHERE phone=$1`,
      [phone]
    );

    if (existing.rows.length) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await pool.query(
      `
      INSERT INTO users (phone, name, password)
      VALUES ($1,$2,$3)
      RETURNING id, phone, name
      `,
      [phone, name || "", hashedPassword]
    );

    const token = jwt.sign(
      { id: user.rows[0].id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);
    res.json({ user: user.rows[0] });
  } catch (err) {
    console.error("OTP register failed:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};
