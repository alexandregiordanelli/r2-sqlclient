import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface ConnectionConfig {
  catalogUri: string;
  apiToken: string;
  name?: string;
}

interface ConnectionStore {
  config: ConnectionConfig | null;
  isConnected: boolean;
  error: string | null;

  connect: (config: ConnectionConfig) => Promise<void>;
  disconnect: () => void;
}

// Load saved connection from localStorage
const loadSavedConnection = (): ConnectionConfig | null => {
  try {
    const saved = localStorage.getItem('r2sql_connection');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useConnectionStore = create<ConnectionStore>((set) => ({
  config: loadSavedConnection(),
  isConnected: false,
  error: null,

  connect: async (config) => {
    try {
      await invoke<string>('connect', {
        catalogUri: config.catalogUri,
        apiToken: config.apiToken,
      });

      // Save to localStorage
      localStorage.setItem('r2sql_connection', JSON.stringify(config));

      set({ config, isConnected: true, error: null });
    } catch (err) {
      set({ error: String(err), isConnected: false });
      throw err;
    }
  },

  disconnect: () => {
    localStorage.removeItem('r2sql_connection');
    set({ config: null, isConnected: false, error: null });
  },
}));
