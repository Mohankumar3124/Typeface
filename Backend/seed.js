const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
require('dotenv').config();

const sampleTransactions = [
  { type: 'income', amount: 75000, category: 'Salary', description: 'Monthly salary', date: new Date('2025-07-01') },
  { type: 'expense', amount: 15000, category: 'Rent', description: 'Monthly rent payment', date: new Date('2025-07-01') },
  { type: 'expense', amount: 3500, category: 'Groceries', description: 'Weekly grocery shopping', date: new Date('2025-07-02') },
  { type: 'expense', amount: 1200, category: 'Transportation', description: 'Petrol for car', date: new Date('2025-07-03') },
  { type: 'expense', amount: 450, category: 'Food', description: 'Lunch at restaurant', date: new Date('2025-07-04') },
  { type: 'expense', amount: 2800, category: 'Utilities', description: 'Electricity bill', date: new Date('2025-07-05') },
  { type: 'expense', amount: 850, category: 'Entertainment', description: 'Movie tickets', date: new Date('2025-07-06') },
  { type: 'income', amount: 8000, category: 'Freelance', description: 'Web design project', date: new Date('2025-07-07') },
  { type: 'expense', amount: 250, category: 'Food', description: 'Coffee and snacks', date: new Date('2025-07-08') },
  { type: 'expense', amount: 2500, category: 'Shopping', description: 'Clothing purchase', date: new Date('2025-07-09') }
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-finance');
    
    console.log('Creating sample user...');
    
    // Check if sample user already exists
    let user = await User.findOne({ email: 'demo@example.com' });
    
    if (!user) {
      user = new User({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123'
      });
      await user.save();
      console.log('✓ Sample user created');
    } else {
      console.log('✓ Sample user already exists');
    }
    
    // Delete existing transactions for this user
    await Transaction.deleteMany({ user: user._id });
    
    console.log('Creating sample transactions...');
    
    // Create sample transactions
    const transactions = sampleTransactions.map(transaction => ({
      ...transaction,
      user: user._id
    }));
    
    await Transaction.insertMany(transactions);
    
    console.log('✓ Sample data created successfully!');
    console.log('\nYou can now login with:');
    console.log('Email: demo@example.com');
    console.log('Password: demo123');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
