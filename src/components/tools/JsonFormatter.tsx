import React from 'react';
import { motion } from 'motion/react';
import { useDevDockStore } from '../../store/devdockStore';
import { Code, CheckCircle, Trash2, AlertCircle, Braces, Minus, Maximize2, Clipboard } from 'lucide-react';

export default function JsonFormatter() {
  const {
    jsonInput, jsonOutput, jsonError, jsonHistory,
    setJsonInput, formatJson, minifyJson, validateJson, clearJson,
  } = useDevDockStore();

  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'editor' | 'history'>('editor');

  const handleCopy = async () => {
    if (!jsonOutput) return;
    await navigator.clipboard.writeText(jsonOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    clearJson();
  };

  const handleHistorySelect = (content: string) => {
    setJsonInput(content);
    setActiveTab('editor');
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Braces size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">JSON Formatter</h3>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${activeTab === 'editor' ? 'bg-indigo-600 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${activeTab === 'history' ? 'bg-indigo-600 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            History ({jsonHistory.length})
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {activeTab === 'editor' ? (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium">Input</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleClear}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-[10px] rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                </div>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"key": "value", "array": [1, 2, 3]}'
                className="flex-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-indigo-500 resize-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={formatJson}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-gray-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Maximize2 size={12} />
                  Format
                </button>
                <button
                  onClick={minifyJson}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded-xl border border-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Minus size={12} />
                  Minify
                </button>
                <button
                  onClick={validateJson}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold rounded-xl border border-gray-200 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle size={12} />
                  Validate
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium">Output</label>
                {jsonOutput && (
                  <button
                    onClick={handleCopy}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 text-[10px] rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {copied ? <CheckCircle size={10} className="text-emerald-600" /> : <Clipboard size={10} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>

              {jsonError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle size={14} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-700 font-mono">Validation Error</p>
                    <p className="text-[10px] text-red-600/80 font-mono mt-0.5">{jsonError}</p>
                  </div>
                </div>
              )}

              {jsonOutput && !jsonError && (
                <pre className="flex-1 w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-emerald-700 font-mono overflow-auto whitespace-pre-wrap">
                  {jsonOutput}
                </pre>
              )}

              {!jsonOutput && !jsonError && (
                <div className="flex-1 flex items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200">
                  <div className="text-center">
                    <Braces size={24} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Enter JSON and click Format</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="col-span-2 overflow-y-auto">
            {jsonHistory.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
                <Code size={16} className="mr-2" />
                No history yet
              </div>
            ) : (
              <div className="space-y-2">
                {jsonHistory.map((item) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleHistorySelect(item.content)}
                    className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-gray-500">{item.label}</span>
                      <span className="text-[10px] text-gray-600">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <pre className="text-[10px] text-gray-500 font-mono truncate">{item.content}</pre>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
