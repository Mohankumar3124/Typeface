# Personal Finance Assistant (India)

A full-stack web application to help users track, manage, and understand their financial activities in Indian Rupees (₹). Built with Node.js, Express, MongoDB for the backend and React with Tailwind CSS for the frontend.
## Features

###  Completed Features
- **User Authentication**: Register and login with JWT-based authentication
- **Transaction Management**: Add, view, filter, and delete income/expense entries
- **PDF Receipt Upload**: Upload PDF receipts to automatically extract and import transactions
- **Dashboard**: Overview with summary cards and recent transactions
- **Analytics & Charts**: 
  - Expenses by category (Pie chart)
  - Monthly income vs expenses (Bar chart)
  - Spending trends over time (Line chart)
  - Category breakdown table
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Date Range Filtering**: Filter transactions and analytics by date range
- **Indian Rupee Support**: Full localization with ₹ currency formatting
- Advanced OCR for receipt images (JPG, PNG)

### 🚧 Planned Features

- Budget setting and tracking
- Export data to CSV/PDF
- Email notifications
- Multi-currency support

## Technology Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cors** - Cross-origin requests
- **Express-validator** - Input validation

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling framework
- **Chart.js & react-chartjs-2** - Charts and graphs
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Project Structure

```
Assignment2/
├── Backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── analytics.js
│   │   └── categories.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── constants.js
│   ├── server.js
│   ├── seed.js
│   └── package.json
└── Frontend/
    └──
        ├── src/
        │   ├── components/
        │   │   ├── Analytics.jsx
        │   │   ├── AuthForm.jsx
        │   │   ├── Dashboard.jsx
        │   │   ├── Navigation.jsx
        │   │   └── TransactionList.jsx
        │   ├── services/
        │   │   └── api.js
        │   ├── App.jsx
        │   └── index.css
        └── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Assignment2/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy .env file and update values
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/personal-finance
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Seed sample data (optional)**
   ```bash
   node seed.js
   ```

5. **Start the backend server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Or production mode
   npm start
   ```

   Backend will be running on `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Assignment2/Frontend/personal-finance-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   Frontend will be running on `http://localhost:5174` (or another port if 5174 is busy)

## Usage

### Demo Account
- **Email**: demo@example.com
- **Password**: demo123

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/range` - Get transactions in date range
- `DELETE /api/transactions/:id` - Delete transaction

#### Analytics
- `GET /api/analytics/categories` - Expenses by category
- `GET /api/analytics/monthly` - Monthly summary
- `GET /api/analytics/trends` - Spending trends
- `GET /api/analytics/summary` - Overall summary

#### Utilities
- `GET /api/categories` - Get predefined categories

#### Receipts
- `POST /api/receipts/upload-receipt` - Upload and process PDF receipt
- `GET /api/receipts/receipt/:filename` - Download receipt file

## Screenshots

### Login/Register Page
- Clean authentication interface with demo account
- Toggle between login and registration
- Form validation and error handling

### Dashboard
- Summary cards showing total income, expenses, and balance
- Recent transactions list
- Responsive grid layout

### Transactions
- Add new income/expense entries
- Filter by date range and type
- Delete transactions with confirmation
- Predefined categories for easy selection
- **PDF Receipt Upload**: Upload PDF receipts to automatically extract transaction data

### PDF Receipt Upload
- Click "Upload Receipt" button in Transactions section
- Select a PDF file containing transaction data
- Supported format: Tables with Type, Amount, Description, Category, Payment Method, Date
- Automatic parsing and import of multiple transactions
- Indian Rupee (₹) amount recognition

### Analytics
- Interactive charts showing spending patterns
- Category breakdown pie chart
- Monthly income vs expenses bar chart
- Spending trends line chart
- Detailed category table with percentages

## Development Notes

### Backend
- JWT tokens expire in 7 days
- Passwords are hashed using bcryptjs
- MongoDB indexes for improved query performance
- Comprehensive error handling and validation
- CORS enabled for frontend communication

### Frontend
- Tailwind CSS for consistent styling
- Custom animations and hover effects
- Chart.js for interactive data visualization
- Axios interceptors for automatic token handling
- Local storage for token persistence


