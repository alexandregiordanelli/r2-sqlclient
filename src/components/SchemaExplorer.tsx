import { useEffect, useState } from 'react';
import { useSchemaStore } from '../stores/schemaStore';
import { useConnectionStore } from '../stores/connectionStore';
import { useQueryStore } from '../stores/queryStore';
import { Database, Table, Columns, Eye, ChevronRight, ChevronDown } from 'lucide-react';

// Schema cache to avoid reloading
const schemaCache = new Map<string, any>();

export function SchemaExplorer() {
  const { isConnected } = useConnectionStore();
  const { namespaces, tables, loadNamespaces, loadTables, loadTableSchema } = useSchemaStore();
  const { setSql, executeQuery } = useQueryStore();
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isConnected) {
      loadNamespaces();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]); // Only depend on isConnected, not loadNamespaces

  const handleTableClick = async (namespace: string, tableName: string) => {
    const tableKey = `${namespace}.${tableName}`;

    // Toggle expansion state
    const isCurrentlyExpanded = expandedTables[tableKey];
    setExpandedTables({ ...expandedTables, [tableKey]: !isCurrentlyExpanded });

    // If collapsing or already cached, just toggle
    if (isCurrentlyExpanded || schemaCache.has(tableKey)) {
      return;
    }

    // Load schema if not in cache
    setLoadingTables({ ...loadingTables, [tableKey]: true });
    try {
      const schema = await loadTableSchema(namespace, tableName);
      console.log('Schema loaded for', tableKey, ':', schema);
      schemaCache.set(tableKey, schema);
      setLoadingTables({ ...loadingTables, [tableKey]: false });
    } catch (err) {
      console.error('Error loading schema:', err);
      setLoadingTables({ ...loadingTables, [tableKey]: false });
    }
  };

  const handlePreviewTable = (namespace: string, tableName: string) => {
    // Generate and execute preview query
    const previewSql = `SELECT * FROM ${namespace}.${tableName} LIMIT 100`;
    setSql(previewSql);
    executeQuery();
  };

  if (!isConnected) {
    return (
      <div className="w-64 bg-slate-800 p-4 flex items-center justify-center text-slate-400">
        <p className="text-sm text-center">Not connected</p>
      </div>
    );
  }

  return (
    <div className="w-56 bg-slate-800 p-2 overflow-y-auto border-r border-slate-700">
      <div className="flex items-center gap-1.5 mb-2">
        <Database className="w-3 h-3" />
        <h3 className="text-xs font-bold">Schema</h3>
      </div>

      {namespaces.length === 0 && (
        <p className="text-xs text-slate-400">No namespaces</p>
      )}

      {namespaces.map(namespace => (
        <div key={namespace} className="mb-1">
          <div
            className="cursor-pointer hover:bg-slate-700 px-1.5 py-1 rounded flex items-center gap-1.5 transition-colors"
            onClick={() => loadTables(namespace)}
          >
            <Database className="w-3 h-3" />
            <span className="text-xs">{namespace}</span>
          </div>

          {tables.filter(t => t.namespace.join('.') === namespace).map(table => {
            const tableKey = `${namespace}.${table.name}`;
            const isExpanded = !!expandedTables[tableKey];
            const isLoading = loadingTables[tableKey];
            const schema = schemaCache.get(tableKey);

            return (
              <div key={table.name} className="ml-3">
                <div className="group hover:bg-slate-700 rounded transition-colors">
                  <div className="px-1.5 py-1 flex items-center gap-1">
                    <div
                      className="flex items-center gap-1 flex-1 cursor-pointer min-w-0"
                      onClick={() => handleTableClick(namespace, table.name)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                      )}
                      <Table className="w-3 h-3 flex-shrink-0" />
                      <span className="text-xs truncate">{table.name}</span>
                      {isLoading && (
                        <span className="text-[10px] text-slate-500">...</span>
                      )}
                    </div>
                    <button
                      onClick={() => handlePreviewTable(namespace, table.name)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-600 rounded transition-all flex-shrink-0"
                      title="Preview data (LIMIT 100)"
                    >
                      <Eye className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Columns - show when expanded */}
                {isExpanded && schema && (
                  <div className="ml-4 mt-0.5 space-y-0">
                    {schema.fields && schema.fields.length > 0 ? (
                      schema.fields.map((field: any) => (
                        <div
                          key={field.id}
                          className="text-[10px] font-mono text-slate-300 hover:bg-slate-700/50 px-1 py-0.5 rounded"
                        >
                          <Columns className="w-2 h-2 inline mr-0.5 text-slate-500" />
                          <span className="text-slate-100">{field.name}</span>
                          <span className="text-slate-500 ml-1">
                            {field.field_type}
                          </span>
                          {field.required && (
                            <span className="text-yellow-500 ml-0.5" title="Required">*</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-slate-500 px-1">No fields</div>
                    )}
                  </div>
                )}
                {isExpanded && !schema && !isLoading && (
                  <div className="ml-4 text-[10px] text-red-400">Failed</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
