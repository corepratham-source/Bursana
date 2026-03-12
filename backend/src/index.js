require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const csrf = require("csurf");
const cookie = require("cookie");

/* ================= ROUTES ================= */

const cartRoutes = require("./routes/cartRoutes");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const { MessagingRouter } = require("./routes/twilioRoutes");
const orderRoutes = require("./routes/orderRoutes");
const ingestRoutes = require("./routes/ingestRoutes");
const productManageRoutes = require("./routes/productManageRoutes");
const csrfRoutes = require("./routes/csrfRoutes");
const auth = require("./middleware/auth");
const optionalAuth = require("./middleware/optionalAuth");

/* ================= ORIGINS ================= */

const allowedOrigins = [
  "https://bursana.com",
  "https://www.bursana.com",
  "http://www.bursana.com",
  "http://localhost:3000",
];

/* ================= CORS MODES ================= */

// 🔓 Public (NO cookies)
const corsPublic = cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("CORS blocked"));
  },
  credentials: false,
});

// 🔐 Private (cookies + CSRF)
const corsPrivate = cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("CORS blocked"));
  },
  credentials: true,
});

/* ================= APP SETUP ================= */

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.path.startsWith("/auth/register")) {
    delete req.headers["x-csrf-token"];
  }
  next();
});

/* ================= RATE LIMIT ================= */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
});

/* ================= CSRF ================= */

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

/* ================= ROUTES ================= */

// 🔓 Handle CORS preflight for public auth routes
app.options("/auth/register/*", corsPublic);

// 🔓 OTP + registration (NO cookies, NO CSRF)
app.use(
  "/auth/register",
  corsPublic,
  authLimiter,
  authRoutes
);

// 🔐 Login + authenticated auth routes
app.use(
  "/auth",
  corsPrivate,
  authLimiter,
  authRoutes
);

// Twilio webhook (external)
app.use("/twilio", MessagingRouter());

// CSRF token fetch
app.use("/csrf", corsPrivate, csrfRoutes);

// 🔐 Protected routes
app.use("/products", corsPrivate, optionalAuth(), csrfProtection, authLimiter, productRoutes);
app.use("/orders", corsPrivate, auth(), csrfProtection, authLimiter, orderRoutes);
app.use("/cart", corsPrivate, auth(), csrfProtection, authLimiter, cartRoutes);
app.use("/ingestion", corsPrivate, auth("supplier"), csrfProtection, authLimiter, ingestRoutes);
app.use(
  "/management/supplier",
  corsPrivate,
  auth("supplier"),
  authLimiter,
  productManageRoutes
);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

/* ================= SOCKET AUTH ================= */

io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    socket.userId = decoded.id;
    socket.role = decoded.role;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
