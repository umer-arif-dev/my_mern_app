const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const path = require("path");
const fs = require("fs");

//const { validationResult } = require('express-validator');

//const upload = require('../middlewares/upload'); // Import the Multer upload middleware




const createBlog = (req, res) => {


  

  console.log("Request received at /api/blogs/create");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Uploaded File:", req.file);

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const { title, content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}`: null;// ✅ Remove "backend/"
    console.log('Final Image URL:', imageUrl);  // Debugging

    console.log("Title:", title);
    console.log("Content:", content);
    console.log("Image URL:", imageUrl);

    if (!title || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const newBlog = new Blog({
      title,
      content,
      imageUrl,
      author: decoded.userId,
    });

    newBlog
      .save()
      .then((blog) => {
        console.log("Blog saved successfully:", blog);
        res.status(201).json({ message: "Blog created successfully", blog });
      })
      .catch((err) => {
        console.error("Error saving blog:", err);
        res.status(500).json({ message: "Error creating blog", error: err });
      });
  } catch (err) {
    console.error("JWT Verification Failed:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};



// Get all blogs with pagination
const getBlogs = async (req, res) => {
  try {
    // Get page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch blogs with pagination
    const blogs = await Blog.find()
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email');

    // Get total count of blogs for pagination metadata
    const totalBlogs = await Blog.countDocuments();

    // Return paginated result with metadata
    res.status(200).json({
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};

// Update a blog (title, content, and image)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params; // Blog ID from the URL
    const { title, content } = req.body; // Updated fields

    // Verify token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the existing blog post
    const existingBlog = await Blog.findOne({ _id: id, author: decoded.userId });
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found or unauthorized" });
    }

    // Handle new image upload
    let newImageUrl = existingBlog.imageUrl; // Default to the existing image
    if (req.file) {
      newImageUrl = `/uploads/${req.file.filename}`; // Store new image URL

      // Delete old image if it exists
      if (existingBlog.imageUrl) {
        const oldImagePath = path.join(__dirname, "../", existingBlog.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath); // Remove old image from server
        }
      }
    }

    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content, imageUrl: newImageUrl, updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json({ message: "Blog updated successfully!", blog: updatedBlog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};




// Delete a blog
const deleteBlog = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id } = req.params; // Blog ID from the request params

    // Find the blog by ID
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the logged-in user is the author of the blog
    if (blog.author.toString() !== decoded.userId) {
      return res.status(403).json({ message: "You are not authorized to delete this blog" });
    }

    // Delete the blog
    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting blog", error: err });
  }
};

module.exports = { createBlog, getBlogs, updateBlog, deleteBlog };
