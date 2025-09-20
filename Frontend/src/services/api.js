import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// Transaction service
export const transactionService = {
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getTransactionsByRange: async (startDate, endDate, type = '') => {
    const params = { startDate, endDate };
    if (type) params.type = type;
    const response = await api.get('/transactions/range', { params });
    return response.data;
  },

  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

// Analytics service
export const analyticsService = {
  getCategorySummary: async (startDate, endDate, type = 'expense') => {
    const params = { type };
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await api.get('/analytics/categories', { params });
    return response.data;
  },

  getMonthlySummary: async (year = new Date().getFullYear()) => {
    const response = await api.get('/analytics/monthly', { params: { year } });
    return response.data;
  },

  getSpendingTrends: async (days = 30, type = 'expense') => {
    const response = await api.get('/analytics/trends', { params: { days, type } });
    return response.data;
  },

  getSummary: async (startDate, endDate) => {
    const params = {};
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await api.get('/analytics/summary', { params });
    return response.data;
  },
};

// Categories service
export const categoriesService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// Receipts service
export const receiptsService = {
  uploadReceipt: async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    const response = await api.post('/receipts/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  testPdfParsing: async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    const response = await api.post('/receipts/test-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getReceipt: async (filename) => {
    const response = await api.get(`/receipts/receipt/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
