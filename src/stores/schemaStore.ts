import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface TableIdentifier {
  namespace: string[];
  name: string;
}

interface Field {
  id: number;
  name: string;
  field_type: string;
  required: boolean;
}

interface Schema {
  fields: Field[];
}

interface SchemaStore {
  namespaces: string[];
  tables: TableIdentifier[];
  selectedTable: TableIdentifier | null;
  tableSchema: Schema | null;
  loading: boolean;

  loadNamespaces: () => Promise<void>;
  loadTables: (namespace: string) => Promise<void>;
  loadTableSchema: (namespace: string, table: string) => Promise<Schema>;
  selectTable: (table: TableIdentifier) => void;
}

export const useSchemaStore = create<SchemaStore>((set) => ({
  namespaces: [],
  tables: [],
  selectedTable: null,
  tableSchema: null,
  loading: false,

  loadNamespaces: async () => {
    set({ loading: true });
    try {
      const namespaces = await invoke<string[]>('list_namespaces');
      set({ namespaces, loading: false });
    } catch (err) {
      console.error('Failed to load namespaces:', err);
      set({ loading: false });
    }
  },

  loadTables: async (namespace) => {
    set({ loading: true });
    try {
      const tables = await invoke<TableIdentifier[]>('list_tables', { namespace });
      set({ tables, loading: false });
    } catch (err) {
      console.error('Failed to load tables:', err);
      set({ loading: false });
    }
  },

  loadTableSchema: async (namespace, table) => {
    set({ loading: true });
    try {
      const schema = await invoke<Schema>('get_table_schema', { namespace, table });
      set({ tableSchema: schema, loading: false });
      return schema;
    } catch (err) {
      console.error('Failed to load schema:', err);
      set({ loading: false });
      throw err;
    }
  },

  selectTable: (table) => {
    set({ selectedTable: table });
  },
}));
