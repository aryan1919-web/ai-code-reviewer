import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ReviewPanel from './components/ReviewPanel';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import toast from 'react-hot-toast';

const DEFAULT_CODE = `// Paste your code here or try this example
function calculateSum(arr) {
  let sum = 0;
  for (var i = 0; i <= arr.length; i++) {
    sum = sum + arr[i];
  }
  return sum;
}

// This code has some bugs - try reviewing it!
const result = calculateSum([1, 2, 3, 4, 5]);
console.log(result);`;

const API_URL = import.meta.env.VITE_API_URL || '';

function AppContent() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileName, setFileName] = useState(null);

  const { isDark } = useTheme();
  const { user, updateStats } = useAuth();

  // Check API health on mount
  useEffect(() => {
    checkApiHealth();
    // Load history from localStorage
    const savedHistory = localStorage.getItem('reviewHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      setApiStatus({ status: 'error', apiKeysConfigured: 0 });
    }
  };

  const handleFileLoad = (content, detectedLanguage, name) => {
    setCode(content);
    setLanguage(detectedLanguage);
    setFileName(name);
    setShowFileUpload(false);
    toast.success(`Loaded ${name}`);
  };

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review');
      return;
    }

    setIsLoading(true);
    setReview(null);

    try {
      const response = await fetch(`${API_URL}/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to review code');
      }

      setReview(data.review);
      toast.success('Code review completed!');

      // Update user stats if logged in
      if (user) {
        updateStats(data.review);
      }

      // Save to history
      const newHistoryItem = {
        id: Date.now(),
        code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
        language,
        score: data.review.score,
        timestamp: data.timestamp,
        fullCode: code,
        review: data.review,
        fileName: fileName,
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('reviewHistory', JSON.stringify(updatedHistory));
      setFileName(null);

    } catch (error) {
      toast.error(error.message);
      console.error('Review error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setCode(item.fullCode);
    setLanguage(item.language);
    setReview(item.review);
    setShowHistory(false);
    toast.success('Loaded from history');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('reviewHistory');
    toast.success('History cleared');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-dark-400 via-dark-300 to-dark-400' 
        : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-72 h-72 ${isDark ? 'bg-primary-600/10' : 'bg-primary-400/20'} rounded-full blur-3xl animate-float`}></div>
        <div className={`absolute bottom-20 right-20 w-96 h-96 ${isDark ? 'bg-teal-600/10' : 'bg-teal-400/20'} rounded-full blur-3xl animate-float`} style={{ animationDelay: '-3s' }}></div>
        <div className={`absolute top-1/2 left-1/2 w-64 h-64 ${isDark ? 'bg-cyan-600/5' : 'bg-cyan-400/10'} rounded-full blur-3xl animate-pulse-slow`}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Header 
          onToggleHistory={() => setShowHistory(!showHistory)} 
          historyCount={history.length}
          apiStatus={apiStatus}
          onShowAuth={() => setShowAuth(true)}
          onShowDashboard={() => setShowDashboard(true)}
          onShowFileUpload={() => setShowFileUpload(true)}
        />
        
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Code Editor */}
            <div className="space-y-4">
              <CodeEditor
                code={code}
                setCode={setCode}
                language={language}
                setLanguage={setLanguage}
                onReview={handleReview}
                isLoading={isLoading}
                onShowFileUpload={() => setShowFileUpload(true)}
                fileName={fileName}
              />
            </div>

            {/* Right Panel - Review Results */}
            <div className="space-y-4">
              <ReviewPanel 
                review={review} 
                isLoading={isLoading}
                originalCode={code}
                language={language}
              />
            </div>
          </div>
        </main>

        {/* History Sidebar */}
        <HistorySidebar
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          history={history}
          onSelect={loadFromHistory}
          onClear={clearHistory}
        />

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
        />

        {/* Dashboard Modal */}
        <Dashboard 
          isOpen={showDashboard} 
          onClose={() => setShowDashboard(false)}
          history={history}
        />

        {/* File Upload Modal */}
        {showFileUpload && (
          <FileUpload
            onFileLoad={handleFileLoad}
            onClose={() => setShowFileUpload(false)}
          />
        )}

        {/* Footer */}
        <footer className={`relative z-10 py-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          <p>Built with ❤️ using React, Tailwind CSS & Gemini AI</p>
          <p className="mt-1">© 2026 CodeReview AI - Your Intelligent Code Assistant</p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
