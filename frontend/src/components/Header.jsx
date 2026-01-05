import { Code2, History, Sparkles, Github, Wifi, WifiOff, Key, Sun, Moon, User, BarChart3, Upload, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

function Header({ onToggleHistory, historyCount, apiStatus, onShowAuth, onShowDashboard, onShowFileUpload }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
      isDark 
        ? 'glass border-primary-500/10' 
        : 'bg-white/80 backdrop-blur-lg border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/30 blur-xl rounded-full"></div>
              <div className="relative p-2 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl">
                <Code2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <span className="text-gradient">CodeReview</span>
                <span className={isDark ? 'text-white' : 'text-gray-800'}>AI</span>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </h1>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Intelligent Code Analysis</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* API Status */}
            <div className={`hidden sm:flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
              apiStatus?.status === 'ok' && apiStatus?.apiKeysConfigured > 0
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {apiStatus?.status === 'ok' && apiStatus?.apiKeysConfigured > 0 ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span className="hidden md:inline">API</span>
                  <div className="flex items-center gap-1 pl-1 border-l border-green-500/30">
                    <Key className="w-3 h-3" />
                    <span>{apiStatus.apiKeysConfigured}</span>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'glass-light hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* File Upload Button */}
            <button
              onClick={onShowFileUpload}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'glass-light hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Upload File"
            >
              <Upload className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* Dashboard Button */}
            <button
              onClick={onShowDashboard}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'glass-light hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Dashboard"
            >
              <BarChart3 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>

            {/* History Button */}
            <button
              onClick={onToggleHistory}
              className={`relative p-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'glass-light hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="History"
            >
              <History className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            {/* User Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                  isDark ? 'glass-light' : 'bg-gray-100'
                }`}>
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    isDark 
                      ? 'glass-light hover:bg-red-500/20' 
                      : 'bg-gray-100 hover:bg-red-100'
                  }`}
                  title="Logout"
                >
                  <LogOut className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                </button>
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex p-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'glass-light hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="GitHub"
            >
              <Github className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
