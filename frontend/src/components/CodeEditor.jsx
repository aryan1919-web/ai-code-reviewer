import Editor from '@monaco-editor/react';
import { Play, Loader2, Code2, ChevronDown, Upload, FileCode } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚡' },
  { id: 'c', name: 'C', icon: '🔵' },
  { id: 'csharp', name: 'C#', icon: '💜' },
  { id: 'go', name: 'Go', icon: '🐹' },
  { id: 'rust', name: 'Rust', icon: '🦀' },
  { id: 'php', name: 'PHP', icon: '🐘' },
  { id: 'ruby', name: 'Ruby', icon: '💎' },
  { id: 'swift', name: 'Swift', icon: '🍎' },
  { id: 'kotlin', name: 'Kotlin', icon: '🎯' },
  { id: 'sql', name: 'SQL', icon: '🗃️' },
  { id: 'html', name: 'HTML', icon: '🌐' },
  { id: 'css', name: 'CSS', icon: '🎨' },
];

function CodeEditor({ code, setCode, language, setLanguage, onReview, isLoading, onShowFileUpload, fileName }) {
  const [showLanguages, setShowLanguages] = useState(false);
  const { isDark } = useTheme();
  
  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${isDark ? 'glass glow-effect' : 'bg-white shadow-xl border border-gray-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <Code2 className="w-4 h-4" />
            <span>{fileName || 'Code Editor'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload Button */}
          <button
            onClick={onShowFileUpload}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Upload File"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Upload</span>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span>{currentLang.icon}</span>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{currentLang.name}</span>
              <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-transform ${showLanguages ? 'rotate-180' : ''}`} />
            </button>

            {showLanguages && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowLanguages(false)}
              ></div>
              <div className={`absolute right-0 mt-2 w-48 py-2 rounded-xl shadow-2xl z-20 max-h-64 overflow-y-auto ${
                isDark ? 'glass' : 'bg-white border border-gray-200'
              }`}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id);
                      setShowLanguages(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                      language === lang.id 
                        ? 'bg-primary-500/20 text-primary-400' 
                        : isDark 
                          ? 'text-gray-300 hover:bg-white/10' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{lang.icon}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="h-[400px] lg:h-[500px]">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme={isDark ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            lineNumbers: 'on',
            roundedSelection: true,
            selectOnLineNumbers: true,
            wordWrap: 'on',
            automaticLayout: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>

      {/* Footer with Review Button */}
      <div className={`px-4 py-4 border-t ${isDark ? 'border-white/5 bg-dark-200/50' : 'border-gray-200 bg-gray-50'}`}>
        <button
          onClick={onReview}
          disabled={isLoading || !code.trim()}
          className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
            isLoading || !code.trim()
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-400 hover:to-cyan-400 hover-glow transform hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Code...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Review Code with AI</span>
            </>
          )}
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Powered by Google Gemini AI • Free & Fast
        </p>
      </div>
    </div>
  );
}

export default CodeEditor;
