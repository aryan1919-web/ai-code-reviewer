import { useState } from 'react';
import { 
  Bug, 
  Zap, 
  Shield, 
  ThumbsUp, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  Code2,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToPDF } from '../utils/exportPDF';

function ReviewPanel({ review, isLoading, originalCode, language }) {
  const [expandedSections, setExpandedSections] = useState({
    bugs: true,
    optimizations: true,
    security: true,
    positives: true,
    improvedCode: false,
  });
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!review) return;
    setExporting(true);
    try {
      await exportToPDF(review, originalCode, language);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    if (score >= 4) return '#f97316';
    return '#ef4444';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8 h-full min-h-[500px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-500/20 rounded-full"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary-400 animate-pulse" />
        </div>
        <p className="mt-6 text-lg font-medium text-gray-300">Analyzing your code...</p>
        <p className="mt-2 text-sm text-gray-500">AI is reviewing for bugs, optimizations & security issues</p>
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!review) {
    return (
      <div className="glass rounded-2xl p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6">
          <Code2 className="w-10 h-10 text-primary-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-200 mb-2">Ready to Review</h3>
        <p className="text-gray-500 max-w-sm">
          Paste your code in the editor and click "Review Code with AI" to get instant feedback on bugs, optimizations, and security issues.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 glass-light rounded-xl">
            <Bug className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Bug Detection</p>
          </div>
          <div className="p-4 glass-light rounded-xl">
            <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Optimization</p>
          </div>
          <div className="p-4 glass-light rounded-xl">
            <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Security</p>
          </div>
        </div>
      </div>
    );
  }

  // Review results
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header with Score */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary-500/10 to-cyan-500/10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Review Results
            </h2>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{review.summary}</p>
          </div>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="mr-4 flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
            title="Export as PDF"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="text-sm hidden sm:inline">Export PDF</span>
          </button>
          
          {/* Score Circle */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-700"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke={getScoreColor(review.score)}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${(review.score / 10) * 220} 220`}
                className="score-circle"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: getScoreColor(review.score) }}>
                {review.score}
              </span>
              <span className="text-xs text-gray-500">/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {/* Bugs Section */}
        {review.bugs && review.bugs.length > 0 && (
          <Section
            title="Bugs Found"
            icon={<Bug className="w-5 h-5 text-red-400" />}
            count={review.bugs.length}
            isExpanded={expandedSections.bugs}
            onToggle={() => toggleSection('bugs')}
            color="red"
          >
            <div className="space-y-3">
              {review.bugs.map((bug, index) => (
                <div key={index} className={`p-4 rounded-xl border ${getSeverityColor(bug.severity)}`}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(bug.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(bug.severity)}`}>
                          {bug.severity}
                        </span>
                        {bug.line && bug.line !== 'N/A' && (
                          <span className="text-xs text-gray-500">Line {bug.line}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{bug.description}</p>
                      {bug.fix && (
                        <p className="text-sm text-green-400 mt-2">
                          <span className="font-medium">Fix:</span> {bug.fix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Optimizations Section */}
        {review.optimizations && review.optimizations.length > 0 && (
          <Section
            title="Optimizations"
            icon={<Zap className="w-5 h-5 text-yellow-400" />}
            count={review.optimizations.length}
            isExpanded={expandedSections.optimizations}
            onToggle={() => toggleSection('optimizations')}
            color="yellow"
          >
            <div className="space-y-3">
              {review.optimizations.map((opt, index) => (
                <div key={index} className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                      {opt.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{opt.description}</p>
                  {opt.suggestion && (
                    <p className="text-sm text-yellow-400 mt-2">
                      <span className="font-medium">Suggestion:</span> {opt.suggestion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Security Section */}
        {review.security && review.security.length > 0 && (
          <Section
            title="Security Issues"
            icon={<Shield className="w-5 h-5 text-orange-400" />}
            count={review.security.length}
            isExpanded={expandedSections.security}
            onToggle={() => toggleSection('security')}
            color="orange"
          >
            <div className="space-y-3">
              {review.security.map((sec, index) => (
                <div key={index} className={`p-4 rounded-xl border ${getSeverityColor(sec.severity)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(sec.severity)}`}>
                      {sec.severity}
                    </span>
                    <span className="text-sm font-medium text-gray-300">{sec.vulnerability}</span>
                  </div>
                  <p className="text-sm text-gray-400">{sec.description}</p>
                  {sec.fix && (
                    <p className="text-sm text-green-400 mt-2">
                      <span className="font-medium">Fix:</span> {sec.fix}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Positives Section */}
        {review.positives && review.positives.length > 0 && (
          <Section
            title="What's Good"
            icon={<ThumbsUp className="w-5 h-5 text-green-400" />}
            count={review.positives.length}
            isExpanded={expandedSections.positives}
            onToggle={() => toggleSection('positives')}
            color="green"
          >
            <ul className="space-y-2">
              {review.positives.map((positive, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{positive}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Improved Code Section */}
        {review.improvedCode && review.improvedCode !== originalCode && (
          <Section
            title="Improved Code"
            icon={<Code2 className="w-5 h-5 text-primary-400" />}
            isExpanded={expandedSections.improvedCode}
            onToggle={() => toggleSection('improvedCode')}
            color="primary"
          >
            <div className="relative">
              <pre className="p-4 bg-dark-300 rounded-xl overflow-x-auto text-sm text-gray-300 font-mono">
                <code>{review.improvedCode}</code>
              </pre>
              <button
                onClick={() => copyCode(review.improvedCode)}
                className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, count, isExpanded, onToggle, color, children }) {
  const colorClasses = {
    red: 'border-red-500/20',
    yellow: 'border-yellow-500/20',
    orange: 'border-orange-500/20',
    green: 'border-green-500/20',
    primary: 'border-primary-500/20',
  };

  return (
    <div className={`rounded-xl border ${colorClasses[color]} overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-200">{title}</span>
          {count !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default ReviewPanel;
