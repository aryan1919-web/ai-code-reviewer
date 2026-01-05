import { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        login(email, password);
        toast.success('Welcome back! 🎉');
      } else {
        if (!name.trim()) {
          throw new Error('Name is required');
        }
        register(name, email, password);
        toast.success('Account created successfully! 🎉');
      }
      onClose();
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass rounded-2xl p-8 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Sign in to access your dashboard' : 'Join CodeReview AI today'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-11 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={4}
                className="w-full pl-11 pr-4 py-3 bg-dark-200/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-6 text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
