import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CellModalProps {
  value: any;
  columnName: string;
  onClose: () => void;
}

export function CellModal({ value, columnName, onClose }: CellModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = value === null ? 'NULL' : String(value);
  const isLong = displayValue.length > 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-800 rounded-lg border border-slate-700 max-w-3xl max-h-[80vh] w-full mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="font-semibold text-slate-200">{columnName}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {displayValue.length.toLocaleString()} characters
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-slate-700 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <pre className={`text-sm font-mono whitespace-pre-wrap break-words ${value === null ? 'text-slate-500 italic' : 'text-slate-200'}`}>
            {displayValue}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <span>Click outside or press ESC to close</span>
          {isLong && (
            <span className="text-amber-400">⚠️ Large content - may affect performance</span>
          )}
        </div>
      </div>
    </div>
  );
}
