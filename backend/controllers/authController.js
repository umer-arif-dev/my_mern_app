const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/mailer');
const crypto = require('crypto'); 




// Signup function
const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ field: "email", message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send a welcome email
        const subject = 'Welcome from umer!';
        const text = `Hello ${name},\n\nThank you for signing up with your email: ${email}.\n\nWe’re excited to have you on board!\n\nBest regards,\nYour App Team`;
        await sendEmail(email, subject, text);

        return res.status(201).json({ token, user: newUser });
    } catch (err) {
        console.error('Signup Error:', err);
        return res.status(500).json({ field: "server", message: 'Internal Server Error' });
    }
};





// Login function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ field: 'email', message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ field: 'password', message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'No user found with that email address.' });
        }

        // Generate a random reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the reset token before storing it in the database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set expiration time (e.g., 1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Send the plain reset token in the email
        const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;
        await sendEmail(
            user.email,
            'Password Reset Request',
            `Please click the following link to reset your password: ${resetUrl}`
        );

        res.status(200).json({ message: 'Password reset email sent successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
};


const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log('Hashed token from frontend:', hashedToken);

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
        });

        if (!user) {
            console.log('No user found with valid token.');
            return res.status(400).json({ message: '' });
              
        }

        console.log('User found:', user);

        // Update the password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        console.log('Password reset successful for user:', user.email);

        res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'An error occurred.' });
    }
};



module.exports = { signup, login ,forgotPassword,resetPassword}


//http://localhost:3001/reset-password/
