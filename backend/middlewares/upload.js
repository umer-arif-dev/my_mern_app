const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadPath = path.join(__dirname, "../uploads"); // Move out of "middlewares" folder
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath); // Save in 'backend/uploads'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, JPEG, PNG) are allowed!"), false);
  }
};

// Only one declaration of 'upload'
const upload = multer({
  storage: storage,  // Existing storage setup
  limits: { fileSize: 2 * 1024 * 1024 },  // 2MB file size limit
  fileFilter: fileFilter  // Use the new fileFilter for validation
});

module.exports = upload;
