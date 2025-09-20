import { useState, useEffect } from 'react';
import { authService } from './services/api';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import Analytics from './components/Analytics';
import Navigation from './components/Navigation';
import { Wallet, LogOut } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.user);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setActiveSection('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="gradient-bg text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Personal Finance Assistant</h1>
            </div>
          </div>
        </div>
        <AuthForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Personal Finance Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="animate-fade-in">
          {activeSection === 'dashboard' && <Dashboard />}
          {activeSection === 'transactions' && <TransactionList />}
          {activeSection === 'analytics' && <Analytics />}
        </div>
      </main>
    </div>
  );
}

export default App;
