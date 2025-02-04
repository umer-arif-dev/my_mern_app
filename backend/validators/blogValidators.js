const { body } = require('express-validator');

const blogValidators = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),

  body('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10 }).withMessage('Content must be at least 10 characters long'),

  body('image')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Image file is required');
      }
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif']; // You can add more formats here
      const fileType = req.file.mimetype;

      if (!validImageTypes.includes(fileType)) {
        throw new Error('Invalid image type. Allowed types: jpeg, png, gif');
      }
      return true;
    })
];

module.exports = { blogValidators };
