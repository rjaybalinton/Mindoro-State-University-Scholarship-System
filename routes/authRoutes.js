const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for registration page
router.get('/register', (req, res) => {
    res.render('register'); // Ensure 'register.ejs' is present in the 'views' folder
});

// Registration route
router.post('/register', authController.register);

// Login route
router.get('/login', (req, res) => {
    res.render('login'); // Ensure 'login.ejs' is present in the 'views' folder
});
router.post('/login', authController.login);

// Email verification route
router.get('/verify', authController.verify);

module.exports = router;
