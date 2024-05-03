const express = require('express');
const router = express.Router();

const { signIn, sendOtp, verifyOtp, resetPassword, signUp } = require('../controllers/authenticatonController');

router.post('/sign-in', signIn);

router.post('/forgot-password', sendOtp);

router.post('/verify-otp', verifyOtp);

router.post('/reset-password', resetPassword);

router.post('/sign-up', signUp);

module.exports = router;