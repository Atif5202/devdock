import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useDevDockStore } from '../../store/devdockStore';
import { Search, Replace, Copy, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegexTester() {
  const {
    regexPattern, regexFlags, regexTestInput, regexTestResults, regexReplaceText, regexReplacedOutput,
    setRegexPattern, setRegexFlags, setRegexTestInput, runRegexTest, runRegexReplace, setRegexReplaceText,
    addNotification,
  } = useDevDockStore();

  useEffect(() => {
    if (!regexPattern) return;
    try {
      new RegExp(regexPattern, regexFlags);
    } catch {
      addNotification('Invalid regex pattern', 'warning');
      return;
    }
    runRegexTest();
  }, [regexPattern, regexFlags, regexTestInput, runRegexTest, addNotification]);

  const [activeTab, setActiveTab] = useState<'test' | 'replace'>('test');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const flags = [
    { id: 'g', label: 'g', title: 'Global' },
    { id: 'i', label: 'i', title: 'Case insensitive' },
    { id: 'm', label: 'm', title: 'Multiline' },
    { id: 's', label: 's', title: 'DotAll' },
    { id: 'u', label: 'u', title: 'Unicode' },
    { id: 'y', label: 'y', title: 'Sticky' },
  ];

  const handleFlagToggle = (flag: string) => {
    const current = regexFlags;
    if (current.includes(flag)) {
      setRegexFlags(current.replace(flag, ''));
    } else {
      setRegexFlags(current + flag);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">Regex Tester</h3>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('test')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${activeTab === 'test' ? 'bg-indigo-600 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Test
          </button>
          <button
            onClick={() => setActiveTab('replace')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${activeTab === 'replace' ? 'bg-indigo-600 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Replace
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium mb-1.5 block">Pattern</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">/</span>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  placeholder="[a-z]+"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-mono">/{regexFlags}</span>
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              {flags.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFlagToggle(f.id)}
                  title={f.title}
                  className={`px-2 py-1 text-[10px] font-mono rounded-md border cursor-pointer transition-colors ${
                    regexFlags.includes(f.id)
                      ? 'bg-indigo-50 border-indigo-500/40 text-indigo-600'
                      : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium mb-1.5 block">Test String</label>
            <textarea
              value={regexTestInput}
              onChange={(e) => setRegexTestInput(e.target.value)}
              placeholder="Enter text to test against..."
              className="flex-1 w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-indigo-500 resize-none min-h-[120px]"
            />
          </div>

          {activeTab === 'replace' && (
            <div>
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium mb-1.5 block">Replace With</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={regexReplaceText}
                  onChange={(e) => setRegexReplaceText(e.target.value)}
                  placeholder="$1 - replacement"
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => { runRegexTest(); runRegexReplace(); }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-gray-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Replace size={12} />
                  Run
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => { runRegexTest(); if (activeTab === 'replace') runRegexReplace(); }}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-gray-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {activeTab === 'test' ? 'Test Regex' : 'Replace All'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium">Results</label>
            <span className="text-[10px] text-gray-500 font-mono">{regexTestResults.length} match{regexTestResults.length !== 1 ? 'es' : ''}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {regexTestResults.length === 0 && regexPattern && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 text-gray-500 text-xs">
                <AlertCircle size={14} className="text-yellow-600" />
                No matches found
              </div>
            )}
            {!regexPattern && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 text-gray-500 text-xs">
                <Search size={14} />
                Enter a pattern to test
              </div>
            )}
            {regexTestResults.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-3 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-indigo-600">#{i + 1}</span>
                      <span className="text-[10px] font-mono text-gray-500">index {r.index}</span>
                    </div>
                    <code className="text-xs text-gray-900 font-mono break-all bg-gray-50 px-2 py-0.5 rounded">
                      {r.match}
                    </code>
                    {Object.keys(r.groups).length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {Object.entries(r.groups).map(([k, v]) => (
                          <div key={k} className="text-[10px] font-mono text-gray-500">
                            <span className="text-emerald-600">{k}</span>: {v}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(r.match, i)}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    {copiedIndex === i ? <CheckCircle size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {activeTab === 'replace' && regexReplacedOutput && (
            <div>
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium mb-1.5 block">Output</label>
              <div className="relative">
                <pre className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-emerald-700 font-mono overflow-auto max-h-[200px] whitespace-pre-wrap">
                  {regexReplacedOutput}
                </pre>
                <button
                  onClick={() => handleCopy(regexReplacedOutput, -1)}
                  className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  {copiedIndex === -1 ? <CheckCircle size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
