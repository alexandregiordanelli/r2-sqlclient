import { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { useSchemaStore } from '../stores/schemaStore';
import { useQueryStore } from '../stores/queryStore';

const R2_SQL_SYNTAX_DOC = `
# Cloudflare R2 SQL Syntax Reference

## Supported Features:
- SQL-92 standard queries
- SELECT, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT
- JOINs (INNER, LEFT, RIGHT, FULL OUTER)
- Subqueries and CTEs (WITH clause)
- 173 scalar functions: CAST, COALESCE, CONCAT, SUBSTRING, UPPER, LOWER, TRIM, LENGTH, REPLACE, etc.
- 33 aggregate functions: COUNT, SUM, AVG, MIN, MAX, STDDEV, VARIANCE, etc.
- Window functions: ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, FIRST_VALUE, LAST_VALUE
- Complex types: STRUCT, ARRAY, MAP access with dot notation and bracket indexing
- Date/Time functions: DATE_TRUNC, EXTRACT, CURRENT_DATE, CURRENT_TIMESTAMP
- String pattern matching: LIKE, ILIKE, REGEXP_MATCH
- Mathematical functions: ROUND, CEIL, FLOOR, ABS, POWER, SQRT, LOG, EXP
- Conditional expressions: CASE WHEN, IF, NULLIF

## Important Notes:
- Always use fully qualified table names: namespace.table_name
- Use LIMIT clause for large tables to avoid timeouts
- Queries have 60-second timeout
- Use WHERE filters before aggregations for better performance
- Column names are case-sensitive
- String literals use single quotes: 'text'
- Array indexing is 1-based: array_column[1]
- Struct field access: struct_column.field_name

## Example Queries:
SELECT * FROM default.users LIMIT 100;
SELECT COUNT(*) FROM default.orders WHERE created_at > '2024-01-01';
SELECT user_id, SUM(amount) as total FROM default.transactions GROUP BY user_id ORDER BY total DESC LIMIT 10;
WITH recent AS (SELECT * FROM default.events WHERE timestamp > CURRENT_DATE - INTERVAL '7 days') SELECT event_type, COUNT(*) FROM recent GROUP BY event_type;
`;

interface AIQueryAssistProps {
  onClose: () => void;
}

// Cache schemas to avoid reloading
const schemaCache = new Map<string, any>();

export function AIQueryAssist({ onClose }: AIQueryAssistProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  const { namespaces, tables } = useSchemaStore();
  const { setSql } = useQueryStore();

  const generateQuery = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setGeneratedQuery('');
    setLoadingMessage('Loading table schemas...');

    try {
      // Import invoke to call Tauri commands
      const { invoke } = await import('@tauri-apps/api/core');

      // Build detailed schema context with columns
      const schemaDetails: string[] = [];
      let loadedTables = 0;
      let totalTables = 0;

      // Count total tables
      for (const ns of namespaces) {
        totalTables += tables.filter(t => t.namespace.join('.') === ns).length;
      }

      for (const ns of namespaces) {
        const nsTables = tables.filter(t => t.namespace.join('.') === ns);
        schemaDetails.push(`\n## Namespace: ${ns}`);

        for (const table of nsTables) {
          loadedTables++;
          setLoadingMessage(`Loading schemas (${loadedTables}/${totalTables})...`);

          const tableFullName = `${ns}.${table.name}`;
          schemaDetails.push(`\n### Table: ${tableFullName}`);

          try {
            // Check cache first
            let schema = schemaCache.get(tableFullName);

            if (!schema) {
              // Load table schema from backend
              schema = await invoke('get_table_schema', {
                namespace: ns,
                table: table.name
              });
              schemaCache.set(tableFullName, schema);
            }

            if (schema && schema.fields && schema.fields.length > 0) {
              schemaDetails.push(`Columns:`);
              schema.fields.forEach((field: any) => {
                const required = field.required ? ' NOT NULL' : ' NULLABLE';
                schemaDetails.push(`  - ${field.name}: ${field.field_type}${required}`);
              });
            }
          } catch (err) {
            console.error(`Failed to load schema for ${tableFullName}:`, err);
            schemaDetails.push(`  (Schema unavailable)`);
          }
        }
      }

      setLoadingMessage('Generating query with AI...');

      const schemaContext = schemaDetails.join('\n');

      const systemPrompt = `You are an expert SQL query generator for Cloudflare R2 SQL.

${R2_SQL_SYNTAX_DOC}

# Available Schema with Exact Column Names:
${schemaContext}

Generate a valid R2 SQL query based on the user's natural language request.

CRITICAL RULES:
1. ONLY use column names that are explicitly listed in the schema above - DO NOT invent or guess column names
2. ALWAYS use fully qualified table names: namespace.table_name (e.g., default.voices)
3. Add LIMIT clause if not specified by user (default LIMIT 100)
4. Match column names EXACTLY as shown in the schema (case-sensitive)
5. If a column doesn't exist in the schema, use the closest available column or explain the limitation
6. Optimize for performance with WHERE filters
7. Use appropriate aggregate functions when needed

OUTPUT FORMAT: Return ONLY the raw SQL query, no explanations, no markdown, no code blocks, just the SQL statement.`;

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          temperature: 0.1,
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const query = data.choices[0].message.content.trim();

      // Clean up the query (remove markdown code blocks if present)
      const cleanQuery = query.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();

      setGeneratedQuery(cleanQuery);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const useQuery = () => {
    setSql(generatedQuery);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-800 rounded-lg border border-slate-700 max-w-3xl w-full mx-4 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-slate-200">AI Query Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm mb-2 text-slate-300">
              What would you like to query?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Show me the top 10 users by total transaction amount in the last 30 days"
              className="w-full px-3 py-2 bg-slate-900 rounded border border-slate-700 focus:outline-none focus:border-primary text-slate-200 min-h-[100px]"
              disabled={loading}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateQuery}
            disabled={loading || !prompt.trim()}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-slate-600 disabled:cursor-not-allowed rounded transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {loadingMessage || 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Query
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-950/30 border border-red-900 rounded p-3">
              {error}
            </div>
          )}

          {/* Generated Query */}
          {generatedQuery && (
            <div>
              <label className="block text-sm mb-2 text-slate-300">
                Generated Query:
              </label>
              <pre className="bg-slate-900 border border-slate-700 rounded p-3 text-sm font-mono text-slate-200 overflow-x-auto">
                {generatedQuery}
              </pre>
              <button
                onClick={useQuery}
                className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                Use This Query
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 text-xs text-slate-400">
          <p>💡 Tip: Be specific about tables, columns, filters, and aggregations for better results</p>
        </div>
      </div>
    </div>
  );
}
