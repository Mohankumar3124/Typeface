const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/receipts/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files (JPG, PNG, GIF, WebP) are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Function to extract text from image using OCR
const extractTextFromImage = async (imagePath) => {
  try {
    console.log('Starting OCR on image:', imagePath);
    
    // Preprocess image for better OCR results
    const processedImagePath = imagePath.replace(/\.[^/.]+$/, '_processed.png');
    await sharp(imagePath)
      .greyscale()
      .normalize()
      .resize({ height: 1200 }) // Resize for better OCR
      .png()
      .toFile(processedImagePath);
    
    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(processedImagePath, 'eng');
    
    // Clean up processed image
    if (fs.existsSync(processedImagePath)) {
      fs.unlinkSync(processedImagePath);
    }
    
    console.log('OCR completed. Extracted text length:', text.length);
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
};

// Function to parse POS receipt text and extract transactions
const parseReceiptText = (text) => {
  const transactions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  console.log('=== PARSING RECEIPT TEXT ===');
  console.log('Total lines:', lines.length);
  
  let currentTransaction = {
    type: 'expense', // POS receipts are usually expenses
    amount: 0,
    description: '',
    category: 'Other',
    date: new Date().toISOString().split('T')[0]
  };
  
  // Look for common POS receipt patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`Line ${i + 1}: "${line}"`);
    
    // Look for total amount patterns common in POS receipts
    const totalPatterns = [
      /total[:\s]*₹?\s*(\d+(?:\.\d{2})?)/i,
      /amount[:\s]*₹?\s*(\d+(?:\.\d{2})?)/i,
      /grand\s*total[:\s]*₹?\s*(\d+(?:\.\d{2})?)/i,
      /net\s*amount[:\s]*₹?\s*(\d+(?:\.\d{2})?)/i,
      /₹\s*(\d+(?:\.\d{2})?)\s*total/i,
      /₹\s*(\d+(?:\.\d{2})?)$/
    ];
    
    for (const pattern of totalPatterns) {
      const match = line.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        if (amount > currentTransaction.amount && amount > 0 && amount < 100000) {
          currentTransaction.amount = amount;
          console.log('Found amount:', amount, 'from line:', line);
        }
      }
    }
    
    // Look for date patterns
    const datePatterns = [
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/,
      /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
      /(\d{1,2}\s+\w{3}\s+\d{4})/i
    ];
    
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          const dateStr = match[1];
          let parsedDate;
          
          if (dateStr.includes('/') || dateStr.includes('-')) {
            const parts = dateStr.split(/[-\/]/);
            if (parts.length === 3) {
              // Handle different date formats
              if (parts[0].length === 4) {
                // YYYY-MM-DD or YYYY/MM/DD
                parsedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              } else {
                // DD-MM-YYYY or MM-DD-YYYY or DD/MM/YYYY or MM/DD/YYYY
                parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
          }
          
          if (parsedDate && new Date(parsedDate).getTime()) {
            currentTransaction.date = parsedDate;
            console.log('Found date:', parsedDate, 'from line:', line);
          }
        } catch (error) {
          console.log('Date parsing error:', error.message);
        }
      }
    }
    
    // Look for merchant/category information
    const merchantPatterns = [
      /restaurant|cafe|food|dining|kitchen|hotel/i,
      /grocery|supermarket|mart|store/i,
      /pharmacy|medical|health|clinic/i,
      /fuel|petrol|gas|station/i,
      /clothing|fashion|apparel/i,
      /electronics|mobile|computer/i
    ];
    
    merchantPatterns.forEach((pattern, index) => {
      if (pattern.test(line)) {
        const categories = [
          'Food & Dining', 'Groceries', 'Healthcare', 
          'Transportation', 'Shopping', 'Electronics'
        ];
        currentTransaction.category = categories[index];
        console.log('Found category:', categories[index], 'from line:', line);
      }
    });
    
    // Collect merchant name or item description
    if (line.length > 3 && line.length < 50 && 
        !line.match(/total|amount|date|time|₹|\d{4}/i) &&
        !currentTransaction.description) {
      currentTransaction.description = line;
      console.log('Found description:', line);
    }
  }
  
  // Add transaction if we found a valid amount
  if (currentTransaction.amount > 0) {
    if (!currentTransaction.description) {
      currentTransaction.description = 'POS Receipt Transaction';
    }
    
    transactions.push({
      type: currentTransaction.type,
      amount: currentTransaction.amount,
      description: currentTransaction.description,
      category: currentTransaction.category,
      paymentMethod: 'Card/UPI', // Default for POS
      date: new Date(currentTransaction.date)
    });
    
    console.log('=== FINAL TRANSACTION ===');
    console.log(currentTransaction);
  }
  
  return transactions;
};

// Function to parse transaction data from PDF text
const parseTransactionFromPDF = (text) => {
  const transactions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Enhanced parsing logic for Indian receipt format
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    console.log(`Processing line ${i + 1}: "${line}"`);
    
    // Look for patterns that indicate transaction data
    // Pattern: Type Amount Description Category PaymentMethod Date
    if (line.toLowerCase().includes('expense') || line.toLowerCase().includes('income')) {
      try {
        // Try to extract transaction details from the line and subsequent lines
        const parts = line.split(/\s+/);
        let type = '';
        let amount = 0;
        let description = '';
        let category = '';
        let paymentMethod = '';
        let date = '';
        
        console.log(`Found transaction line: "${line}"`);
        console.log('Parts:', parts);
        
        // Parse concatenated transaction data (e.g., "Expense250Groceries29-07-2025")
        // First, extract the type
        if (line.toLowerCase().includes('expense')) {
          type = 'expense';
        } else if (line.toLowerCase().includes('income')) {
          type = 'income';
        }
        
        if (type) {
          // Remove the type from the beginning to get the rest
          let remaining = line.replace(/^(expense|income)/i, '');
          console.log('Remaining after type removal:', remaining);
          
          // Extract date pattern first (DD-MM-YYYY at the end)
          const dateMatch = remaining.match(/(\d{2}-\d{2}-\d{4})$/);
          if (dateMatch) {
            const [day, month, year] = dateMatch[1].split('-');
            date = `${year}-${month}-${day}`;
            // Remove date from remaining string
            remaining = remaining.replace(/\d{2}-\d{2}-\d{4}$/, '');
            console.log('Date found:', date);
            console.log('Remaining after date removal:', remaining);
          }
          
          // Now extract amount from the beginning (should be just numbers)
          const amountMatch = remaining.match(/^(\d+(?:\.\d{1,2})?)/);
          if (amountMatch) {
            amount = parseFloat(amountMatch[1]);
            // Remove amount from remaining string to get category
            remaining = remaining.replace(/^\d+(?:\.\d{1,2})?/, '');
            console.log('Amount found:', amount);
            console.log('Remaining after amount removal (category):', remaining);
          }
          
          // What's left should be the category
          if (remaining) {
            category = remaining.trim();
            console.log('Category found:', category);
          }
        }
        
        // Look for date in DD-MM-YYYY format (backup if not found above)
        if (!date) {
          const dateMatch = line.match(/(\d{2}-\d{2}-\d{4})/);
          if (dateMatch) {
            const [day, month, year] = dateMatch[1].split('-');
            date = `${year}-${month}-${day}`;
          }
        }
        
        // Extract description, category, and payment method from context
        // This is a simplified approach - in production, you'd use more sophisticated NLP
        const commonCategories = [
          'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
          'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 
          'Groceries', 'Rent/EMI', 'Insurance', 'Fitness', 'Salary', 
          'Freelance', 'Investment'
        ];
        
        const commonPaymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cash'];
        
        // Map extracted categories to our standard categories
        if (category) {
          const categoryLower = category.toLowerCase();
          if (categoryLower.includes('grocery') || categoryLower.includes('groceries')) {
            category = 'Groceries';
          } else if (categoryLower.includes('transport') || categoryLower.includes('auto') || categoryLower.includes('taxi')) {
            category = 'Transportation';
          } else if (categoryLower.includes('rent') || categoryLower.includes('housing')) {
            category = 'Rent/EMI';
          } else if (categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('dining')) {
            category = 'Food & Dining';
          } else if (categoryLower.includes('utility') || categoryLower.includes('utilities') || categoryLower.includes('electricity') || categoryLower.includes('water')) {
            category = 'Bills & Utilities';
          } else if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('medicine')) {
            category = 'Healthcare';
          } else if (categoryLower.includes('subscription') || categoryLower.includes('netflix') || categoryLower.includes('spotify')) {
            category = 'Entertainment';
          } else if (categoryLower.includes('salary') || categoryLower.includes('income')) {
            category = type === 'income' ? 'Salary' : 'Other';
          } else if (categoryLower.includes('gift')) {
            category = type === 'income' ? 'Other Income' : 'Other';
          } else if (categoryLower.includes('freelance') || categoryLower.includes('freelancing')) {
            category = type === 'income' ? 'Freelance' : 'Other';
          } else {
            // Keep the original category if it doesn't match any pattern
            category = category.charAt(0).toUpperCase() + category.slice(1);
          }
        }
        
        // Look for category keywords (backup if not extracted above)
        if (!category) {
          for (const cat of commonCategories) {
            if (line.toLowerCase().includes(cat.toLowerCase()) || 
                (i + 1 < lines.length && lines[i + 1].toLowerCase().includes(cat.toLowerCase()))) {
              category = cat;
              break;
            }
          }
        }
        
        // Look for payment method keywords
        for (const method of commonPaymentMethods) {
          if (line.toLowerCase().includes(method.toLowerCase()) || 
              (i + 1 < lines.length && lines[i + 1].toLowerCase().includes(method.toLowerCase()))) {
            paymentMethod = method;
            break;
          }
        }
        
        // Extract description (everything that's not type, amount, category, payment method, or date)
        let descWords = parts.filter(word => {
          const wordLower = word.toLowerCase();
          return !wordLower.includes('expense') && 
                 !wordLower.includes('income') && 
                 !word.match(/^\d+([,\.]\d+)*$/) && 
                 !word.match(/^\d{2}-\d{2}-\d{4}$/) &&
                 !commonCategories.some(cat => wordLower.includes(cat.toLowerCase())) &&
                 !commonPaymentMethods.some(method => wordLower.includes(method.toLowerCase()));
        });
        
        description = descWords.join(' ').substring(0, 100); // Limit description length
        
        // Set defaults if not found
        if (!category) category = type === 'income' ? 'Other Income' : 'Other';
        if (!paymentMethod) paymentMethod = 'Other';
        if (!date) date = new Date().toISOString().split('T')[0];
        if (!description) description = 'Imported from receipt';
        
        // Only add if we have valid type and amount
        if (type && amount > 0) {
          transactions.push({
            type,
            amount,
            description,
            category,
            paymentMethod,
            date: new Date(date)
          });
        }
      } catch (error) {
        console.error('Error parsing transaction line:', line, error);
      }
    }
  }
  
  return transactions;
};

// Test endpoint to debug receipt parsing (PDF or Image)
router.post('/test-receipt', auth, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let extractedText = '';
    let additionalInfo = {};

    // Process based on file type
    if (req.file.mimetype === 'application/pdf') {
      // Handle PDF files
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdf(pdfBuffer);
      extractedText = pdfData.text;
      additionalInfo = {
        numberOfPages: pdfData.numpages,
        info: pdfData.info,
        fileType: 'PDF'
      };
    } else if (req.file.mimetype.startsWith('image/')) {
      // Handle Image files with OCR
      extractedText = await extractTextFromImage(req.file.path);
      additionalInfo = {
        fileType: 'Image',
        imageFormat: req.file.mimetype
      };
    } else {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'Unsupported file type. Please upload PDF or image files.' 
      });
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      message: 'Receipt parsing test results',
      extractedText: extractedText,
      textLines: extractedText.split('\n').map((line, index) => ({
        lineNumber: index + 1,
        content: line.trim(),
        length: line.trim().length
      })).filter(line => line.length > 0),
      ...additionalInfo
    });
    
  } catch (error) {
    console.error('Receipt test error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error testing receipt',
      error: error.message 
    });
  }
});

// Upload and process receipt (PDF or Image)
router.post('/upload-receipt', auth, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('=== RECEIPT PROCESSING ===');
    console.log('File type:', req.file.mimetype);
    console.log('File size:', req.file.size);
    console.log('File path:', req.file.path);

    let extractedText = '';
    let extractedTransactions = [];

    // Process based on file type
    if (req.file.mimetype === 'application/pdf') {
      // Handle PDF files
      console.log('Processing PDF file...');
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdf(pdfBuffer);
      extractedText = pdfData.text;
      
      console.log('=== PDF TEXT ===');
      console.log(extractedText);
      console.log('===============');
      
      extractedTransactions = parseTransactionFromPDF(extractedText);
    } else if (req.file.mimetype.startsWith('image/')) {
      // Handle Image files with OCR
      console.log('Processing image file with OCR...');
      extractedText = await extractTextFromImage(req.file.path);
      
      console.log('=== OCR TEXT ===');
      console.log(extractedText);
      console.log('================');
      
      extractedTransactions = parseReceiptText(extractedText);
    } else {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'Unsupported file type. Please upload PDF or image files.' 
      });
    }

    console.log('=== EXTRACTED TRANSACTIONS ===');
    console.log('Number of transactions found:', extractedTransactions.length);
    extractedTransactions.forEach((trans, index) => {
      console.log(`Transaction ${index + 1}:`, {
        type: trans.type,
        amount: trans.amount,
        description: trans.description,
        category: trans.category,
        date: trans.date
      });
    });
    console.log('===============================');
    
    if (extractedTransactions.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'No valid transactions found in the receipt. Please check if the receipt is clear and contains transaction data.' 
      });
    }
    
    // Save transactions to database
    const savedTransactions = [];
    for (const transactionData of extractedTransactions) {
      const transaction = new Transaction({
        ...transactionData,
        user: req.user._id,
        receipt: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path
        }
      });
      
      const savedTransaction = await transaction.save();
      savedTransactions.push(savedTransaction);
    }
    
    res.json({
      message: `Successfully imported ${savedTransactions.length} transaction(s) from receipt`,
      transactions: savedTransactions,
      extractedText: extractedText.substring(0, 500) + '...' // First 500 chars for debugging
    });
    
  } catch (error) {
    console.error('PDF upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error processing PDF receipt',
      error: error.message 
    });
  }
});

// Get receipt file
router.get('/receipt/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join('uploads/receipts/', filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).json({ message: 'Receipt file not found' });
    }
  } catch (error) {
    console.error('Error serving receipt file:', error);
    res.status(500).json({ message: 'Error serving receipt file' });
  }
});

module.exports = router;
