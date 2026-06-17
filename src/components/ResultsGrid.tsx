import { useMemo, useState } from 'react';
import { useQueryStore } from '../stores/queryStore';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { AlertCircle, Database, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Search, Eye, EyeOff, Columns as ColumnsIcon } from 'lucide-react';
import { CellModal } from './CellModal';

export function ResultsGrid() {
  const { result, error } = useQueryStore();
  const [selectedCell, setSelectedCell] = useState<{ value: any; columnName: string } | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Prepare data for table - MUST happen before any early returns to avoid hook order issues
  const queryResult = result?.result;
  const hasValidData = queryResult && queryResult.rows && queryResult.schema && queryResult.rows.length > 0;

  const columns = useMemo(() => {
    if (!hasValidData || !queryResult.schema) return [];

    return queryResult.schema.map(col => ({
      accessorKey: col.name,
      header: col.name,
      enableSorting: true,
      enableColumnFilter: true,
      cell: (info: any) => {
        const value = info.getValue();
        const displayValue = value === null ? 'NULL' : String(value);
        const truncated = displayValue.length > 50 ? displayValue.substring(0, 50) + '...' : displayValue;

        return (
          <button
            onClick={() => setSelectedCell({ value, columnName: col.name })}
            className="w-full text-left font-mono text-xs hover:bg-slate-700/30 px-1 rounded transition-colors truncate block"
            title="Click to expand"
          >
            {value === null ? (
              <span className="text-slate-500 italic truncate block">{displayValue}</span>
            ) : (
              <span className="text-slate-200 truncate block">{displayValue}</span>
            )}
          </button>
        );
      },
      filterFn: 'includesString',
    }));
  }, [hasValidData, queryResult?.schema]);

  const table = useReactTable({
    data: hasValidData ? queryResult.rows : [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  });

  // Now we can do conditional rendering AFTER all hooks are called
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-950/30 border border-red-900 rounded-lg p-6 max-w-2xl">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold">Query Error</h3>
          </div>
          <p className="text-red-300 text-sm font-mono">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No results</p>
          <p className="text-sm text-slate-500">Run a query to see results</p>
        </div>
      </div>
    );
  }

  if (!queryResult || !queryResult.rows || !queryResult.schema) {
    console.error('Invalid query result structure:', result);
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
          <p>Invalid result format</p>
          <p className="text-sm text-slate-500">Check console for details</p>
        </div>
      </div>
    );
  }

  if (queryResult.rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Query returned 0 rows</p>
        </div>
      </div>
    );
  }

  const columnCount = queryResult.schema.length;

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 px-2 py-1 flex items-center gap-2">
        {/* Global Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="w-full pl-7 pr-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded focus:outline-none focus:border-primary"
          />
        </div>

        {/* Column Visibility Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors flex items-center gap-1"
            title="Show/Hide Columns"
          >
            <ColumnsIcon className="w-3 h-3" />
            Columns
          </button>

          {showColumnMenu && (
            <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
              <div className="p-2 border-b border-slate-700 flex items-center justify-between">
                <span className="text-xs font-semibold">Toggle Columns</span>
                <button
                  onClick={() => setShowColumnMenu(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              <div className="p-1">
                <label className="flex items-center gap-2 px-2 py-1 hover:bg-slate-700 rounded cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={table.getIsAllColumnsVisible()}
                    onChange={table.getToggleAllColumnsVisibilityHandler()}
                    className="rounded"
                  />
                  <span className="font-semibold">Toggle All</span>
                </label>
                {table.getAllLeafColumns().map(column => (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-slate-700 rounded cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded"
                    />
                    <span className="truncate">{column.id}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="text-[10px] text-slate-400">
          {table.getFilteredRowModel().rows.length !== queryResult.rows.length && (
            <span>
              {table.getFilteredRowModel().rows.length} filtered of {queryResult.rows.length} total
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-800 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-2 py-0.5 text-left font-semibold border-b border-slate-600 text-xs max-w-xs">
                    {header.isPlaceholder ? null : (
                      <div className="space-y-0.5">
                        <div
                          className={`flex items-center gap-1 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:text-primary' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span className="truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="flex-shrink-0">
                              {{
                                asc: <ArrowUp className="w-3 h-3" />,
                                desc: <ArrowDown className="w-3 h-3" />,
                              }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3 h-3 opacity-40" />}
                            </span>
                          )}
                        </div>
                        {header.column.getCanFilter() && (
                          <input
                            type="text"
                            value={(header.column.getFilterValue() ?? '') as string}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            placeholder="Filter..."
                            className="w-full px-1 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded focus:outline-none focus:border-primary"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className="h-6 border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-2 py-0 max-w-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cell Modal */}
      {selectedCell && (
        <CellModal
          value={selectedCell.value}
          columnName={selectedCell.columnName}
          onClose={() => setSelectedCell(null)}
        />
      )}

      {/* Status Bar with Pagination */}
      <div className="flex-shrink-0 bg-slate-800 border-t-2 border-slate-700">
        {/* Pagination Controls */}
        {queryResult.rows.length > 100 && (
          <div className="px-2 py-1 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-xs text-slate-300 mx-1">
                Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                <span className="text-slate-500 ml-1">
                  ({table.getRowModel().rows.length} of {queryResult.rows.length})
                </span>
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <label className="text-xs text-slate-400">Per page:</label>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="px-2 py-1 text-[10px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200 text-xs">
              📊 {table.getFilteredRowModel().rows.length.toLocaleString()}
              {table.getFilteredRowModel().rows.length !== queryResult.rows.length && (
                <span className="text-slate-400 font-normal"> of {queryResult.rows.length.toLocaleString()}</span>
              )} {table.getFilteredRowModel().rows.length === 1 ? 'row' : 'rows'}
            </span>
            <span className="text-slate-400">
              {table.getVisibleLeafColumns().length} / {columnCount} col{columnCount === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queryResult.metrics?.files_scanned && (
              <span className="text-slate-400">
                📁 {queryResult.metrics.files_scanned.toLocaleString()} files
              </span>
            )}
            {queryResult.metrics?.bytes_scanned && (
              <span className="text-slate-400">
                💾 {(queryResult.metrics.bytes_scanned / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
