const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../utils/multer");

const {
  getSupplierProducts,
  updateProduct,
  deleteProduct,
  addProductImages,
  removeProductImage
} = require("../controllers/productManageController");

/**
 * GET Supplier Products
 */
router.get("/products", auth, getSupplierProducts);

/**
 * UPDATE Product (Supplier Only)
 */
router.put("/products/:productId", auth, updateProduct);

/**
 * DELETE Product
 */
router.delete("/products/:productId", auth, deleteProduct);
router.post(
  "/products/:productId/images",
  auth,
  upload.array("images", 10),
  addProductImages
);

/**
 * REMOVE image
 */
router.delete(
  "/products/:productId/images",
  auth,
  removeProductImage
);

module.exports = router;