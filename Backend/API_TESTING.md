# Personal Finance Assistant - API Testing Guide

The backend is now running on `http://localhost:5000`

## Testing the API Endpoints

You can test these endpoints using tools like Postman, Thunder Client (VS Code extension), or curl commands.

### 1. Register a new user
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Create a transaction (requires token from login)
```bash
POST http://localhost:5000/api/transactions
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "type": "expense",
  "amount": 199.50,
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2025-07-28"
}
```

### 4. Get all transactions
```bash
GET http://localhost:5000/api/transactions
Authorization: Bearer YOUR_TOKEN_HERE
```

### 5. Get transactions in date range
```bash
GET http://localhost:5000/api/transactions/range?startDate=2025-07-01&endDate=2025-07-31
Authorization: Bearer YOUR_TOKEN_HERE
```

### 6. Get expenses by category
```bash
GET http://localhost:5000/api/analytics/categories
Authorization: Bearer YOUR_TOKEN_HERE
```

### 7. Get monthly summary
```bash
GET http://localhost:5000/api/analytics/monthly?year=2025
Authorization: Bearer YOUR_TOKEN_HERE
```

### 8. Get spending trends
```bash
GET http://localhost:5000/api/analytics/trends?days=30&type=expense
Authorization: Bearer YOUR_TOKEN_HERE
```

### 9. Get summary statistics
```bash
GET http://localhost:5000/api/analytics/summary
Authorization: Bearer YOUR_TOKEN_HERE
```

## Common Categories for Testing
- Food
- Transportation
- Shopping
- Utilities
- Entertainment
- Healthcare
- Education
- Travel
- Salary (for income)
- Freelance (for income)
