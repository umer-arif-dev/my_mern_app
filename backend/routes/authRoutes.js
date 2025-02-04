const express = require('express');
const { signup, login , logout} = require('../controllers/authController');  // Ensure correct path to authController
const { signupValidator, loginValidator } = require('../validators/validators'); // Import validators
const { validationResult } = require('express-validator'); // Import validation result handler
const checkAuth = require('../middlewares/checkAuth'); // Import the JWT verification middleware
const { forgotPassword ,resetPassword} = require('../controllers/authController'); // Import functions


const router = express.Router();

// Signup route
router.post('/signup', signupValidator, (req, res, next) => {
    const errors = validationResult(req);  // Collect validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // If validation errors exist, send them back
    }
    next();  // Proceed to the signup controller if no errors
}, signup);

// Login route
router.post('/login', loginValidator, (req, res, next) => {
    const errors = validationResult(req);  // Collect validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // If validation errors exist, send them back
    }
    next();  // Proceed to the login controller if no errors
}, login);

//Example of a protected route that requires authentication
router.get('/profile', checkAuth, (req, res) => {
   res.status(200).json({ message: 'This is your profile', userId: req.userId });
});

 //Logout route
router.post('/logout', (req, res) => {
   // console.log('Logout route hit');
  res.status(200).json({ message: 'Logout successful' });
});

// Forgot Password route
router.post('/forgot-password', forgotPassword);


router.post('/reset-password', resetPassword);


module.exports = router;

