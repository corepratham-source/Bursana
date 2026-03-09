const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");

const {
  uploadImages,
  processDescription,
  finalizeProduct
} = require("../controllers/ingestionController");

router.post("/images", upload.array("images", 10), uploadImages);
router.post("/description", processDescription);
router.post("/finalize", finalizeProduct);

module.exports = router;
