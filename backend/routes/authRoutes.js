const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../utils/validators');
const validate = require('../middlewares/validatorMiddleware');

const router = express.Router();

// Route: Register new user (patient or doctor)
router.post('/register', registerValidator, validate, register);

// Route: Log in existing user
router.post('/login', loginValidator, validate, login);

// Route: Log out user
router.post('/logout', logout);

module.exports = router;
