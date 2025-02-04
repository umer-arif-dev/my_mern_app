const jwt = require('jsonwebtoken');

// Middleware to check if JWT is expired or invalid
const checkAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded user ID to the request object
        req.userId = decoded.userId;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        // If JWT verification fails (expired or invalid token)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = checkAuth;
