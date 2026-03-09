const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const { uploadImages } = require("../controllers/uploadController");

router.post("/", upload.array("image", 10), uploadImages);

module.exports = router;
