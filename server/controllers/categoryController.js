const Category = require('../models/Category');

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const image = req.file ? req.file.location : null;

        if (!name || !image) {
            return res.status(400).json({ success: false, message: 'Name and image are required' });
        }

        const normalizedName = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
        const existingCategory = await Category.findOne({ name: normalizedName });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'Category with this name already exists' });
        }

        const category = new Category({ name: normalizedName, image });
        await category.save();

        res.status(201).json({ success: true, message: 'Category created successfully', category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCategories = async (req, res) => {
    try {
        const query = {};
        if (req.query.activeOnly === 'true') {
            query.isActive = true;
        }
        const categories = await Category.find(query).sort({ createdAt: -1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const updateData = {};

        if (name !== undefined) {
            updateData.name = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
        }
        if (isActive !== undefined) updateData.isActive = isActive;

        if (req.file) {
            updateData.image = req.file.location;
        }

        const category = await Category.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({ success: true, message: 'Category updated successfully', category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory
};
