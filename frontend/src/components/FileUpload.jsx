import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCode, X } from 'lucide-react';

const languageMap = {
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'cs': 'csharp',
  'go': 'go',
  'rs': 'rust',
  'php': 'php',
  'rb': 'ruby',
  'swift': 'swift',
  'kt': 'kotlin',
  'sql': 'sql',
  'html': 'html',
  'css': 'css',
};

function FileUpload({ onFileLoad, onClose }) {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const extension = file.name.split('.').pop().toLowerCase();
        const language = languageMap[extension] || 'javascript';
        onFileLoad(content, language, file.name);
      };
      reader.readAsText(file);
    }
  }, [onFileLoad]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/*': ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.sql', '.html', '.css']
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass rounded-2xl p-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileCode className="w-6 h-6 text-primary-400" />
          Upload Code File
        </h2>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'border-primary-500 bg-primary-500/10' 
              : 'border-white/20 hover:border-primary-500/50 hover:bg-white/5'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-primary-400' : 'text-gray-500'}`} />
          
          {isDragActive ? (
            <p className="text-primary-400 font-medium">Drop the file here...</p>
          ) : (
            <>
              <p className="text-gray-300 font-medium mb-2">
                Drag & drop a code file here
              </p>
              <p className="text-gray-500 text-sm">
                or click to select a file
              </p>
            </>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500">
            Supported: .js, .jsx, .ts, .tsx, .py, .java, .cpp, .c, .cs, .go, .rs, .php, .rb, .swift, .kt, .sql, .html, .css
          </p>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
