import { useState, useEffect } from 'react';
import { useConnectionStore } from '../stores/connectionStore';

export function ConnectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { connect, error, config } = useConnectionStore();

  const [catalogUri, setCatalogUri] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [testing, setTesting] = useState(false);

  // Load saved connection when dialog opens
  useEffect(() => {
    if (open && config) {
      setCatalogUri(config.catalogUri);
      setApiToken(config.apiToken);
    }
  }, [open, config]);

  const handleTest = async () => {
    setTesting(true);
    try {
      // Extract account and bucket from URI
      const parts = catalogUri.trim().split('/');
      const accountId = parts[parts.length - 2] || 'unknown';
      const bucketName = parts[parts.length - 1] || 'unknown';

      alert(`Extracted from URI:\n\nAccount ID: ${accountId}\nBucket: ${bucketName}\n\nWill test: ${catalogUri}/v1/config`);
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connect({ catalogUri, apiToken });
      onClose();
    } catch (err) {
      // Error is already in store
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-[500px] border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Connect to R2 SQL</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-300">Catalog URI</label>
            <input
              type="text"
              value={catalogUri}
              onChange={(e) => setCatalogUri(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 rounded border border-slate-700 focus:outline-none focus:border-primary"
              placeholder="https://catalog.cloudflarestorage.com/account_id/bucket_name"
            />
            <p className="text-xs text-slate-400 mt-1">
              Format: https://catalog.cloudflarestorage.com/{'<account_id>/<bucket_name>'}
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1 text-slate-300">API Token</label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 rounded border border-slate-700 focus:outline-none focus:border-primary"
              placeholder="your-cloudflare-api-token"
            />
            <p className="text-xs text-slate-400 mt-1">
              Token with R2 SQL + Data Catalog permissions
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 border border-red-900 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-between mt-6">
            <button
              onClick={handleTest}
              disabled={!catalogUri || testing}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed rounded transition-colors"
            >
              {testing ? 'Testing...' : 'Test URI'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!catalogUri || !apiToken}
                className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-slate-600 disabled:cursor-not-allowed rounded transition-colors"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
