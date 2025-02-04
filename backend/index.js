// Load environment variables from the .env file in the backend folder
require('dotenv').config({ path: './backend/.env' });

// Other imports
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const checkAuth = require('./middlewares/checkAuth');  // Import checkAuth middleware
const blogRoutes = require('./routes/blogroutes');
const path = require('path');




// Connect to the database
connectDB();

// Initialize Express app
const app = express();
app.use(express.json());
// Enable CORS
app.use(cors({
    origin: process.env.LOCAL_URL,  // Using the LOCAL_URL from the .env file
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
}));

// Middleware to parse JSON 
// Authentication routes
app.use('/api/auth',authRoutes);
app.use('/api/blogs', blogRoutes);


// Serve static files (images) from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Other middleware and routes here...



// Your other middlewares and routes...



// Protected route example using checkAuth middleware
app.get('/api/protected', checkAuth, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.userId });  // Access userId from the middleware
});

// Simple test route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
