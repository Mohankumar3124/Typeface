const express = require('express');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES } = require('../utils/constants');

const router = express.Router();

// Get predefined categories
router.get('/categories', (req, res) => {
  res.json({
    expense: EXPENSE_CATEGORIES,
    income: INCOME_CATEGORIES
  });
});

module.exports = router;
