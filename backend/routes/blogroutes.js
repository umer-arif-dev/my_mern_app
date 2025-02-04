// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth');
const upload = require('../middlewares/upload'); // Import the multer file upload middleware
const { createBlog, getBlogs, updateBlog, deleteBlog } = require('../controllers/blogcontroller');
const { blogValidators } = require('../validators/blogValidators'); // Import the validator



router.post('/create',blogValidators, checkAuth, upload.single('image'), createBlog);  // Handle image upload in createBlog
router.get('/', getBlogs);
router.put('/update/:id', checkAuth, upload.single('image'), updateBlog);
router.delete('/delete/:id', checkAuth, deleteBlog);



module.exports = router;
