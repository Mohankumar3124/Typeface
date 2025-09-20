const express = require('express');
const mongoose = require('mongoose');

// Simple test to check if server can start
const testServer = async () => {
  try {
    console.log('Testing server setup...');
    
    // Test Express
    const app = express();
    console.log('✓ Express initialized');
    
    // Test MongoDB connection (optional - will work even if MongoDB is not running)
    try {
      await mongoose.connect('mongodb://localhost:27017/personal-finance-test', {
        serverSelectionTimeoutMS: 2000
      });
      console.log('✓ MongoDB connection successful');
      await mongoose.connection.close();
    } catch (error) {
      console.log('⚠ MongoDB not running (this is OK for now)');
    }
    
    console.log('✓ Backend setup is ready!');
    console.log('\nNext steps:');
    console.log('1. Install MongoDB locally or use MongoDB Atlas');
    console.log('2. Run: npm run dev (to start with nodemon)');
    console.log('3. Or run: npm start (to start normally)');
    
  } catch (error) {
    console.error('❌ Setup test failed:', error.message);
  }
};

testServer();
