const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Get expenses by category
router.get('/categories', auth, async (req, res) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;
    
    // Build match criteria
    const matchCriteria = {
      user: req.user._id,
      type: type
    };

    if (startDate && endDate) {
      matchCriteria.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const categoryData = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ categoryData });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching category data' });
  }
});

// Get monthly spending summary
router.get('/monthly', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: '$_id.month',
          type: '$_id.type',
          total: { $round: ['$total', 2] },
          count: 1,
          _id: 0
        }
      },
      { $sort: { month: 1, type: 1 } }
    ]);

    // Format data for easier frontend consumption
    const formattedData = {};
    monthlyData.forEach(item => {
      if (!formattedData[item.month]) {
        formattedData[item.month] = { income: 0, expense: 0 };
      }
      formattedData[item.month][item.type] = item.total;
    });

    res.json({ monthlyData: formattedData });
  } catch (error) {
    console.error('Get monthly data error:', error);
    res.status(500).json({ message: 'Server error fetching monthly data' });
  }
});

// Get spending trends by date
router.get('/trends', auth, async (req, res) => {
  try {
    const { days = 30, type = 'expense' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trendData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: type,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({ trendData });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ message: 'Server error fetching trend data' });
  }
});

// Get summary statistics
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build match criteria
    const matchCriteria = { user: req.user._id };
    if (startDate && endDate) {
      matchCriteria.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          _id: 0
        }
      }
    ]);

    // Format summary data
    const formattedSummary = {
      income: { total: 0, count: 0 },
      expense: { total: 0, count: 0 }
    };

    summary.forEach(item => {
      formattedSummary[item.type] = item;
    });

    formattedSummary.balance = formattedSummary.income.total - formattedSummary.expense.total;

    res.json({ summary: formattedSummary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error fetching summary data' });
  }
});

module.exports = router;
