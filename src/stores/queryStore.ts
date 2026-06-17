import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface QueryResponse {
  result: QueryResult | null;
  success: boolean;
  errors: any[];
  messages: any[];
}

interface QueryResult {
  rows: any[];
  schema: SchemaField[];
  metrics: QueryMetrics | null;
}

interface SchemaField {
  name: string;
}

interface QueryMetrics {
  files_scanned?: number;
  bytes_scanned?: number;
}

interface QueryStore {
  sql: string;
  result: QueryResponse | null;
  loading: boolean;
  error: string | null;
  cancelled: boolean;

  setSql: (sql: string) => void;
  executeQuery: () => Promise<void>;
  cancelQuery: () => void;
  clearResult: () => void;
}

export const useQueryStore = create<QueryStore>((set, get) => ({
  sql: '',
  result: null,
  loading: false,
  error: null,
  cancelled: false,

  setSql: (sql) => set({ sql }),

  executeQuery: async () => {
    const { sql } = get();
    if (!sql.trim()) return;

    set({ loading: true, error: null, cancelled: false });

    try {
      const result = await invoke<QueryResponse>('execute_query', { sql });

      console.log('Query result:', result);

      // Check if query was cancelled while waiting
      if (get().cancelled) {
        set({ loading: false, cancelled: false });
        return;
      }

      // Check if API returned an error
      if (!result.success || (result.errors && result.errors.length > 0)) {
        const errorMsg = result.errors?.[0]?.message || 'Query failed';
        set({ error: errorMsg, loading: false, result: null });
        return;
      }

      set({ result, loading: false, error: null });
    } catch (err) {
      console.error('Query error:', err);
      // Check if cancelled
      if (get().cancelled) {
        set({ loading: false, error: null, cancelled: false });
        return;
      }
      set({ error: String(err), loading: false });
    }
  },

  cancelQuery: () => {
    set({ cancelled: true, loading: false, error: 'Query cancelled by user' });
  },

  clearResult: () => set({ result: null, error: null }),
}));
