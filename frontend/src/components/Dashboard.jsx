import { useState } from 'react';
import { X, BarChart3, Target, Bug, Sparkles, TrendingUp, Calendar, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard({ isOpen, onClose, history }) {
  const { user } = useAuth();

  if (!isOpen) return null;

  // Calculate stats from history
  const totalReviews = history.length;
  const avgScore = totalReviews > 0 
    ? Math.round(history.reduce((acc, h) => acc + (h.score || 0), 0) / totalReviews) 
    : 0;
  const totalBugs = history.reduce((acc, h) => acc + (h.review?.bugs?.length || 0), 0);
  const languageBreakdown = history.reduce((acc, h) => {
    acc[h.language] = (acc[h.language] || 0) + 1;
    return acc;
  }, {});

  // Get last 7 reviews for trend
  const recentReviews = history.slice(0, 7).reverse();
  const scoreHistory = recentReviews.map(h => h.score || 0);
  const labels = recentReviews.map((_, i) => `Review ${i + 1}`);

  // Chart data
  const lineChartData = {
    labels,
    datasets: [{
      label: 'Code Score',
      data: scoreHistory,
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
    }]
  };

  const doughnutData = {
    labels: Object.keys(languageBreakdown),
    datasets: [{
      data: Object.values(languageBreakdown),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(14, 165, 233, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.5)' },
        min: 0,
        max: 10
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255,255,255,0.7)',
          padding: 15,
          usePointStyle: true,
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass rounded-2xl p-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary-400" />
            Dashboard
          </h2>
          <p className="text-gray-400 mt-1">
            {user ? `Welcome, ${user.name}!` : 'Your code review statistics'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-light rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <Target className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalReviews}</p>
                <p className="text-xs text-gray-400">Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="glass-light rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{avgScore}/10</p>
                <p className="text-xs text-gray-400">Avg Score</p>
              </div>
            </div>
          </div>

          <div className="glass-light rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Bug className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalBugs}</p>
                <p className="text-xs text-gray-400">Bugs Found</p>
              </div>
            </div>
          </div>

          <div className="glass-light rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {avgScore >= 8 ? '🔥' : avgScore >= 6 ? '⭐' : avgScore >= 4 ? '👍' : '🎯'}
                </p>
                <p className="text-xs text-gray-400">
                  {avgScore >= 8 ? 'Excellent!' : avgScore >= 6 ? 'Good!' : avgScore >= 4 ? 'Keep Going!' : 'Start Now!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Trend */}
          <div className="glass-light rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Score Trend
            </h3>
            <div className="h-48">
              {recentReviews.length > 0 ? (
                <Line data={lineChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data yet. Start reviewing code!
                </div>
              )}
            </div>
          </div>

          {/* Language Distribution */}
          <div className="glass-light rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Languages Used
            </h3>
            <div className="h-48">
              {Object.keys(languageBreakdown).length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data yet. Start reviewing code!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {history.length > 0 && (
          <div className="mt-6 glass-light rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between p-3 bg-dark-200/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded">
                      {item.language}
                    </span>
                    <span className="text-sm text-gray-300 truncate max-w-[200px]">
                      {item.code?.substring(0, 30)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${
                      item.score >= 8 ? 'text-green-400' : 
                      item.score >= 6 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {item.score}/10
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
