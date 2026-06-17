import { useState, useEffect } from 'react';
import { ConnectionDialog } from './components/ConnectionDialog';
import { SchemaExplorer } from './components/SchemaExplorer';
import { QueryEditor } from './components/QueryEditor';
import { ResultsGrid } from './components/ResultsGrid';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useConnectionStore } from './stores/connectionStore';
import { Database, Settings, Loader2, PanelLeftClose, PanelLeft } from 'lucide-react';

function App() {
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editorHeight, setEditorHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const { isConnected, config, disconnect } = useConnectionStore();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isResizing) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const newHeight = e.clientY - 56; // 56px is header height
        if (newHeight >= 200 && newHeight <= window.innerHeight * 0.7) {
          setEditorHeight(newHeight);
        }
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isResizing]);

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h1 className="text-sm font-bold">R2 SQL Client</h1>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && config ? (
            <>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-400">Connected to</span>
                <span className="text-slate-200 font-medium">
                  {config.catalogUri.split('/').pop() || 'R2 SQL'}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowConnectionDialog(true)}
              className="px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 rounded transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-3 h-3" />
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <ErrorBoundary>
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Toggle Button */}
          {!sidebarCollapsed && <SchemaExplorer />}

          {/* Main Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sidebar Toggle Button */}
            <div className="bg-slate-800 border-b border-slate-700 px-1.5 py-0.5 flex items-center">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-0.5 hover:bg-slate-700 rounded transition-colors"
                title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="w-3 h-3" />
                ) : (
                  <PanelLeftClose className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Query Editor - Resizable */}
            <div
              className="border-b-2 border-slate-700 overflow-hidden flex-shrink-0"
              style={{ height: `${editorHeight}px` }}
            >
              <QueryEditor />
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={`h-1 bg-slate-700 hover:bg-primary cursor-ns-resize transition-colors ${
                isResizing ? 'bg-primary' : ''
              }`}
              title="Drag to resize"
            />

            {/* Results Grid - Takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              <ResultsGrid />

              {/* Overlay during resize to prevent heavy re-renders */}
              {isResizing && (
                <div className="absolute inset-0 bg-transparent z-50 cursor-ns-resize" />
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {/* Connection Dialog */}
      <ConnectionDialog
        open={showConnectionDialog}
        onClose={() => setShowConnectionDialog(false)}
      />
    </div>
  );
}

export default App;
