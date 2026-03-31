const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { uploadCategoryS3 } = require('../middleware/s3UploadMiddleware');

// Get categories - Public or authenticated
router.get('/', categoryController.getCategories);

// Admin protected routes
router.post('/', authenticateToken, isAdmin, uploadCategoryS3.single('image'), categoryController.createCategory);
router.put('/:id', authenticateToken, isAdmin, uploadCategoryS3.single('image'), categoryController.updateCategory);

module.exports = router;
