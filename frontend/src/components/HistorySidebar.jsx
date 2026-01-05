import { X, Clock, Trash2, Code2 } from 'lucide-react';

function HistorySidebar({ isOpen, onClose, history, onSelect, onClear }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400 bg-green-500/10';
    if (score >= 6) return 'text-yellow-400 bg-yellow-500/10';
    if (score >= 4) return 'text-orange-400 bg-orange-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 glass z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            <h2 className="font-semibold text-white">Review History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-[calc(100%-130px)]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                <Code2 className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">No review history yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Your code reviews will appear here
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full text-left p-4 glass-light rounded-xl hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(item.timestamp)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreColor(item.score)}`}>
                      {item.score}/10
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase">
                      {item.language}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-mono truncate group-hover:text-gray-300 transition-colors">
                    {item.code}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-dark-200/80 backdrop-blur-sm">
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Clear History</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default HistorySidebar;
