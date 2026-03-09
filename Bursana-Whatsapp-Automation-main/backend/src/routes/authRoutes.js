const express = require('express');
const router = express.Router();
const { login, registration, supplierLogin, requestOtp, verifyOtpAndRegister, supplierRegister } = require('../controllers/authController');

router.post('/login', login);
//router.post('/register', registration);
router.post("/supplier/login", supplierLogin);
router.post("/supplier/registration", supplierRegister);
router.post("/register/requestOtp", requestOtp);
router.post("/register/verifyOtp", verifyOtpAndRegister);
module.exports = router;
