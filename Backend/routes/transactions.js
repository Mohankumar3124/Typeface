const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all transactions for the user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category } = req.query;
    
    // Build filter object
    const filter = { user: req.user._id };
    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

// Get transactions in date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const filter = {
      user: req.user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions by range error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

// Create new transaction
router.post('/', [
  auth,
  body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, category, description, date } = req.body;

    const transaction = new Transaction({
      user: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : new Date()
    });

    await transaction.save();
    
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
});

module.exports = router;
