const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { uploadCategory } = require('../middleware/uploadMiddleware');

// Get categories - Public or authenticated
router.get('/', categoryController.getCategories);

// Admin protected routes
router.post('/', authenticateToken, isAdmin, uploadCategory.single('image'), categoryController.createCategory);
router.put('/:id', authenticateToken, isAdmin, uploadCategory.single('image'), categoryController.updateCategory);

module.exports = router;
