// Common expense categories for Indian users
const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Rent/EMI',
  'Insurance',
  'Fitness',
  'Personal Care',
  'Gifts & Festivals',
  'Charity/Donation',
  'Mobile/Internet',
  'Domestic Help',
  'Other'
];

// Common income categories
const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental',
  'Gift',
  'Bonus',
  'Other'
];

// Transaction types
const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

// API response messages
const MESSAGES = {
  SUCCESS: {
    USER_REGISTERED: 'User registered successfully',
    LOGIN_SUCCESSFUL: 'Login successful',
    TRANSACTION_CREATED: 'Transaction created successfully',
    TRANSACTION_DELETED: 'Transaction deleted successfully'
  },
  ERROR: {
    USER_EXISTS: 'User already exists with this email',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TRANSACTION_NOT_FOUND: 'Transaction not found',
    UNAUTHORIZED: 'No token, authorization denied',
    INVALID_TOKEN: 'Token is not valid',
    SERVER_ERROR: 'Server error'
  }
};

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TRANSACTION_TYPES,
  MESSAGES
};
