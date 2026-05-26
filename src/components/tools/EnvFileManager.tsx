import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useDevDockStore } from '../../store/devdockStore';
import { FileText, Plus, Trash2, Copy, CheckCircle, Eye, EyeOff, ToggleLeft, ToggleRight, Layers } from 'lucide-react';

export default function EnvFileManager() {
  const {
    envEntries, envProfiles, envActiveProfile,
    addEnvEntry, updateEnvEntry, removeEnvEntry, toggleEnvEntry, setEnvActiveProfile, addEnvProfile, copyEnvToClipboard,
  } = useDevDockStore();

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showValues, setShowValues] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const filteredEntries = envEntries.filter((e) => e.profile === envActiveProfile);

  const handleAdd = () => {
    if (!newKey.trim()) return;
    addEnvEntry(newKey.trim(), newValue);
    setNewKey('');
    setNewValue('');
  };

  const handleCopyAll = async () => {
    const text = filteredEntries
      .filter((e) => e.enabled)
      .map((e) => `${e.key}=${e.value}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    copyEnvToClipboard();
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    addEnvProfile(newProfileName.trim());
    setNewProfileName('');
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">Env File Manager</h3>
        </div>
        <button
          onClick={() => setShowValues(!showValues)}
          className="px-2 py-1 bg-gray-100 hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-[10px] rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
        >
          {showValues ? <EyeOff size={10} /> : <Eye size={10} />}
          {showValues ? 'Hide' : 'Show'} Values
        </button>
      </div>

      <div className="flex gap-2">
        <Layers size={14} className="text-gray-500 mt-0.5" />
        <div className="flex flex-wrap gap-1.5 flex-1">
          {envProfiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setEnvActiveProfile(p.name)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded-lg border transition-colors cursor-pointer ${
                envActiveProfile === p.name
                  ? 'bg-indigo-50 border-indigo-500/40 text-indigo-600'
                  : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.name}
            </button>
          ))}
          <div className="flex gap-1">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="+ new profile"
              className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddProfile()}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="KEY_NAME"
          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="value"
          className="flex-[2] px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-gray-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
            <FileText size={16} className="mr-2" />
            No entries for this profile
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors group ${
                  entry.enabled
                    ? 'bg-white border-gray-200'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <button
                  onClick={() => toggleEnvEntry(entry.id)}
                  className="cursor-pointer text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {entry.enabled ? <ToggleRight size={16} className="text-indigo-600" /> : <ToggleLeft size={16} />}
                </button>

                <input
                  type="text"
                  value={entry.key}
                  onChange={(e) => updateEnvEntry(entry.id, e.target.value, entry.value)}
                  className="flex-1 px-2 py-1 bg-transparent border border-transparent focus:border-indigo-500/40 rounded text-xs text-indigo-600 font-mono focus:outline-none focus:bg-gray-50"
                />
                <input
                  type={showValues ? 'text' : 'password'}
                  value={entry.value}
                  onChange={(e) => updateEnvEntry(entry.id, entry.key, e.target.value)}
                  className="flex-[2] px-2 py-1 bg-transparent border border-transparent focus:border-indigo-500/40 rounded text-xs text-gray-700 font-mono focus:outline-none focus:bg-gray-50"
                />

                <button
                  onClick={() => removeEnvEntry(entry.id)}
                  className="p-1.5 bg-gray-100 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 size={11} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <span className="text-[10px] text-gray-500 font-mono">
          {filteredEntries.filter((e) => e.enabled).length} / {filteredEntries.length} active
        </span>
        <button
          onClick={handleCopyAll}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-[10px] rounded-lg border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
        >
          {copied ? <CheckCircle size={10} className="text-emerald-600" /> : <Copy size={10} />}
          {copied ? 'Copied!' : 'Copy .env'}
        </button>
      </div>
    </div>
  );
}
