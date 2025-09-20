# Personal Finance Assistant Backend

## Environment Variables
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personal-finance
JWT_SECRET=your-secret-key-here

## Installation
```bash
npm install
```

## Development
```bash
npm run dev
```

## Production
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Transactions
- GET /api/transactions - Get all transactions for user
- POST /api/transactions - Create new transaction
- GET /api/transactions/range - Get transactions in date range
- DELETE /api/transactions/:id - Delete transaction

### Analytics
- GET /api/analytics/categories - Get expenses by category
- GET /api/analytics/monthly - Get monthly spending summary
