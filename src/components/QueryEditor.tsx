import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useQueryStore } from '../stores/queryStore';
import { Play, Loader2, X, Sparkles } from 'lucide-react';
import { AIQueryAssist } from './AIQueryAssist';

export function QueryEditor() {
  const { sql, setSql, executeQuery, cancelQuery, loading } = useQueryStore();
  const [showAIAssist, setShowAIAssist] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuery();
    }
  };

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown}>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 border-b border-slate-700">
        {loading ? (
          <button
            onClick={cancelQuery}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        ) : (
          <>
            <button
              onClick={executeQuery}
              disabled={!sql.trim()}
              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Execute
            </button>
            <button
              onClick={() => setShowAIAssist(true)}
              className="px-2 py-1 text-xs bg-primary hover:bg-primary/90 rounded transition-colors flex items-center gap-1"
              title="AI Query Assistant"
            >
              <Sparkles className="w-3 h-3" />
              AI
            </button>
          </>
        )}

        {loading && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            Running...
          </div>
        )}

        {!loading && !sql.toUpperCase().includes('LIMIT') && sql.trim() && (
          <div className="text-[10px] text-amber-500 flex items-center gap-0.5">
            ⚠️ Add LIMIT
          </div>
        )}
      </div>

      <Editor
        height="300px"
        language="sql"
        theme="vs-dark"
        value={sql}
        onChange={(value) => setSql(value || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: false,
        }}
      />

      {/* AI Query Assistant Modal */}
      {showAIAssist && <AIQueryAssist onClose={() => setShowAIAssist(false)} />}
    </div>
  );
}
