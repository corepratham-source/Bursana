const jwt = require("jsonwebtoken");

module.exports = () => {
  return (req, _res, next) => {
    // Allow unauthenticated users; attach req.user only when token is valid.
    const token = req.cookies?.token;
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore invalid/expired token for public browsing routes.
    }

    next();
  };
};
