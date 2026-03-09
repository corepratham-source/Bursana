const express = require("express");
const router = express.Router();
const csrf = require("csurf");

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"? true : false,
    sameSite: "none",
  },
});

router.get("/token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;
