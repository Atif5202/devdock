import React from 'react';
import { motion } from 'motion/react';
import { useDevDockStore } from '../../store/devdockStore';
import { Database, Play, Code, Trash2, Copy, CheckCircle, Clock, Table, Loader2 } from 'lucide-react';

export default function SqlEditor() {
  const {
    sqlInput, sqlQueryResult, sqlHistory, sqlLoading,
    setSqlInput, runSqlQuery, formatSql, clearSql,
  } = useDevDockStore();

  const [copied, setCopied] = React.useState(false);

  const handleCopyResult = async () => {
    if (!sqlQueryResult) return;
    const csv = [
      sqlQueryResult.columns.join(','),
      ...sqlQueryResult.rows.map((r) => sqlQueryResult.columns.map((c) => r[c]).join(',')),
    ].join('\n');
    await navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    runSqlQuery();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">SQL Editor</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-mono">Cmd+Enter to run</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium">Query</label>
            <div className="flex gap-1.5">
              <button
                onClick={formatSql}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-[10px] rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Code size={10} /> Format
              </button>
              <button
                onClick={clearSql}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-[10px] rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={10} /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC;"
            className="w-full h-[120px] px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <button
            onClick={handleRun}
            disabled={sqlLoading || !sqlInput.trim()}
            className="self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {sqlLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Run Query
          </button>
        </div>

        {sqlQueryResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Table size={14} className="text-emerald-600" />
                <span className="text-xs text-gray-500">
                  <span className="text-gray-900 font-bold">{sqlQueryResult.rowCount}</span> rows returned
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Clock size={10} />
                  {sqlQueryResult.executionTime}ms
                </span>
              </div>
              <button
                onClick={handleCopyResult}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 text-[10px] rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                {copied ? <CheckCircle size={10} className="text-emerald-600" /> : <Copy size={10} />}
                {copied ? 'Copied' : 'CSV'}
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {sqlQueryResult.columns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider border-b border-gray-200">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sqlQueryResult.rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      {sqlQueryResult.columns.map((col) => (
                        <td key={col} className="px-3 py-2 text-gray-700 font-mono text-[11px]">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {!sqlQueryResult && sqlHistory.length > 0 && (
          <div>
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium mb-2 block">History</label>
            <div className="space-y-1">
              {sqlHistory.slice(0, 5).map((q, i) => (
                <button
                  key={i}
                  onClick={() => setSqlInput(q)}
                  className="w-full text-left p-2 rounded-lg bg-gray-50 border border-gray-200 hover:border-indigo-200 text-[10px] text-gray-500 font-mono truncate transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
