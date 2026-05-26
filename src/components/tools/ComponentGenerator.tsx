/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDevDockStore } from '../../store/devdockStore';
import { GeneratedComponent } from '../../types';
import { 
  Sparkles, 
  Copy, 
  Eye, 
  Code, 
  RefreshCw, 
  ChevronRight, 
  Activity,
  Plus,
  Trash2
} from 'lucide-react';

export default function ComponentGenerator() {
  const {
    componentLibrary,
    selectedComponent,
    loadingComponentAI,
    selectedComponentVariant,
    updateComponentCode,
    addComponent,
    removeComponent,
    setSelectedComponent,
    setLoadingComponentAI,
    setSelectedComponentVariant,
    addNotification
  } = useDevDockStore();

  const [promptInput, setPromptInput] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Custom component wizard states
  const [isCreating, setIsCreating] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<'button' | 'card' | 'modal'>('button');

  const handleCreateCustomComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName) return;

    const formattedName = newCompName.replace(/[^a-zA-Z0-9]/g, '');
    const id = 'custom-' + Date.now();
    const newComp: GeneratedComponent = {
      id,
      name: newCompName,
      type: newCompType,
      variant: 'minimalist',
      code: `// Custom React Component: ${newCompName}\n// Built inline with DevDock Interactive Studio\n\nimport React from "react";\n\nexport default function ${formattedName}() {\n  return (\n    <div className="p-6 bg-slate-900 border border-gray-200 rounded-2xl max-w-sm text-center shadow-lg animate-fade-in">\n      <h3 className="text-md font-bold text-gray-900 mb-2">${newCompName}</h3>\n      <p className="text-xs text-gray-500">Cette vue a été générée en temps réel comme une nouvelle pièce maîtresse pour vos designs.</p>\n      <button className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-gray-900 rounded-xl text-xs font-semibold">\n        Interact\n      </button>\n    </div>\n  );\n}`,
      props: {}
    };

    addComponent(newComp);

    setNewCompName('');
    setIsCreating(false);
    addNotification(`Nouveau composant "${newCompName}" initialisé !`, 'success');
  };

  const handleDeleteCustomComponent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(id);
    addNotification('Composant personnalisé supprimé.', 'info');
  };

  // Simple copy helper
  const handleCopyCode = () => {
    if (!selectedComponent) return;
    navigator.clipboard.writeText(selectedComponent.code);
    addNotification('React + Tailwind Component code copied!', 'success');
  };

  // Connect to Gemini backend AI Generator
  const handleAIGenerateComponent = async () => {
    if (!selectedComponent) return;
    setLoadingComponentAI(true);
    addNotification('Compilation du composant en cours...', 'info');

    try {
      const resp = await fetch('/api/ai/component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedComponent.type,
          variant: selectedComponentVariant,
          promptInput: promptInput
        })
      });

      if (!resp.ok) {
        throw new Error('API key missing or lookup error');
      }

      const data = await resp.json();
      if (data.code) {
        updateComponentCode(selectedComponent.id, data.code);
        setActiveTab('preview');
        addNotification('Composant AI compilé avec succès et chargé dans le workspace !', 'success');
      }
    } catch (err: unknown) {
      console.warn('Backend compiler failed, scaling to dynamic local compilation fallback...', err);
      
      const lowercasePrompt = promptInput.toLowerCase();
      let simulatedCode: string;
      
      if (lowercasePrompt.includes('stats') || lowercasePrompt.includes('metric') || lowercasePrompt.includes('dashboard')) {
        simulatedCode = `import React from 'react';
import { TrendingUp, Users, ArrowUpRight, DollarSign } from 'lucide-react';

export default function SaaSDashboardStats() {
  return (
    <div className="p-6 bg-[#0d1527] border border-gray-200 rounded-2xl max-w-md shadow-xl animate-fade-in text-left">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-900 font-semibold font-sans text-sm">Monthly Operational Balance</h3>
        <span className="flex items-center text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          +14.8% <ArrowUpRight size={12} className="ml-0.5" />
        </span>
      </div>
      
      <div className="my-3">
        <span className="text-3xl font-extrabold text-gray-900 font-mono">$45,210.80</span>
        <p className="text-xs text-gray-500 mt-1 font-sans">Including automated stripe gateway triggers</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 border-t border-gray-200 pt-4">
        <div>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">Active Users</span>
          <span className="text-md font-bold text-gray-900 font-mono">2,840 creators</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">Core CPU load</span>
          <span className="text-md font-bold text-indigo-600 font-mono">1.2% idle</span>
        </div>
      </div>
    </div>
  );
}`;
      } else if (lowercasePrompt.includes('terminal') || lowercasePrompt.includes('command') || lowercasePrompt.includes('box')) {
        simulatedCode = `import React, { useState } from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';

export default function DeveloperDockerConsole() {
  const [logs, setLogs] = useState<string[]>([
    '[system] DevDock local daemon online',
    '[docker] Container instances listening on port 3000',
    '[database] Persistent database blueprint provisioned successfully'
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const simulateLogsTrigger = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLogs(prev => [
        ...prev,
        \`[trigger] Client state updated successfully: \${new Date().toLocaleTimeString()}\`
      ]);
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-4 font-mono text-xs text-left text-green-400 shadow-2xl">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2.5 mb-3">
        <div className="flex items-center gap-1.5">
          <Terminal size={14} className="text-green-500" />
          <span className="font-bold text-gray-900">devdock-daemon@workspace</span>
        </div>
        <button 
          onClick={simulateLogsTrigger}
          disabled={isRefreshing}
          className="hover:bg-white/10 p-1 rounded-lg text-gray-500 cursor-pointer"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-green-400' : ''} />
        </button>
      </div>
      
      <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
        {logs.map((log, i) => (
          <div key={i} className="leading-relaxed">
            <span className="text-gray-600 select-none mr-1.5">&gt;</span>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}`;
      } else if (lowercasePrompt.includes('pricing') || lowercasePrompt.includes('billing') || lowercasePrompt.includes('card')) {
        simulatedCode = `import React from 'react';
import { Check, Sparkles } from 'lucide-react';

export default function ProBillingCard() {
  return (
    <div className="p-6 bg-[#0f172a] border-2 border-indigo-500/40 rounded-3xl max-w-sm text-left shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-indigo-500 text-gray-900 text-[9px] font-mono tracking-widest font-bold px-3 py-1 uppercase rounded-bl-xl flex items-center gap-1">
        <Sparkles size={10} /> Popular
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Developer SaaS Core</h3>
      <p className="text-xs text-gray-500 font-sans">Ideal package for scaling collaborative tech startups</p>
      
      <div className="my-5 flex items-baseline gap-1.5">
        <span className="text-4xl font-extrabold text-gray-900 font-mono">$29</span>
        <span className="text-xs text-gray-500 font-sans">/ user / mo</span>
      </div>

      <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-gray-900 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer">
        Deploy instant tier
      </button>

      <ul className="mt-5 space-y-2.5 text-xs text-gray-700 font-sans border-t border-gray-200 pt-5">
        {['Unlimited custom component codeboxes', 'Real-time WCAG accessibility validator', 'Interactive Figma system sync compiler', 'Premium standard developer companion API'].map((feat, idx) => (
          <li key={idx} className="flex gap-2 items-start">
            <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>{feat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}`;
      } else {
        // Simple and elegant dynamic placeholder
        const formattedName = selectedComponent.name.replace(/[^a-zA-Z0-9]/g, '');
        simulatedCode = `import React from 'react';
import { Sparkles, Star } from 'lucide-react';

export default function ${formattedName}() {
  return (
    <div className="p-6 bg-slate-900 border border-gray-200 rounded-2xl max-w-sm text-center shadow-lg animate-fade-in">
      <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 mx-auto flex items-center justify-center mb-3">
        <Sparkles size={20} className="animate-pulse" />
      </div>
      <h3 className="text-md font-bold text-gray-900 mb-1.5">${selectedComponent.name}</h3>
      <p className="text-xs text-gray-500">${promptInput || 'Cette vue interactive personnalisée a été générée instantanément pour concrétiser vos idées de design.'}</p>
      <div className="mt-4 flex gap-2 justify-center">
        <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-gray-900 rounded-lg text-xs font-medium cursor-pointer">
          Action principale
        </button>
        <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium cursor-pointer">
          En savoir plus
        </button>
      </div>
    </div>
  );
}`;
      }

      updateComponentCode(selectedComponent.id, simulatedCode);
      setActiveTab('preview');
      addNotification(`[Simulation Locale Active] Composant généré pour "${promptInput || selectedComponent.name}"`, 'info');
      
    } finally {
      setLoadingComponentAI(false);
    }
  };

  // Mock Component Live render sandbox logic
  const [btnClicks, setBtnClicks] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInteractiveComponentInstance = () => {
    if (!selectedComponent) return null;

    switch (selectedComponent.type) {
      case 'button':
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <button
              onClick={() => {
                setBtnClicks(prev => prev + 1);
                addNotification('Bouton cliqué dans le sandbox!', 'info');
              }}
              className={`relative px-6 py-2.5 rounded-xl font-medium text-gray-900 transition-all overflow-hidden flex items-center gap-1.5 ${
                selectedComponentVariant === 'cyberpunk' 
                  ? 'border-2 border-pink-500 bg-white text-pink-500 hover:bg-pink-500 hover:text-gray-900 shadow-[0_0_15px_rgba(236,72,153,0.3)] rounded-none'
                  : selectedComponentVariant === 'glass'
                  ? 'bg-white/5 border border-gray-200 backdrop-blur-md hover:bg-white/10 shadow-lg'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 shadow-md shadow-blue-500/20'
              }`}
            >
              <Activity size={13} className="animate-pulse text-indigo-600" />
              Click Counter Button
            </button>
            <p className="text-xs text-gray-500 font-mono">Nombre de clics : {btnClicks}</p>
          </div>
        );

      case 'card':
        return (
          <div className="flex items-center justify-center p-6">
            <div 
              className={`relative p-6 max-w-sm rounded-2xl border transition-all ${
                selectedComponentVariant === 'cyberpunk'
                  ? 'border-cyan-500 bg-white text-cyan-400 font-mono rounded-none'
                  : selectedComponentVariant === 'glass'
                  ? 'border-gray-200 bg-white/5 backdrop-blur-md'
                  : 'border-gray-200 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-widest text-gray-500">Node cluster status</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <h4 className="text-2xl font-bold font-mono text-gray-900 mb-1">4.2 ms latency</h4>
              <p className="text-xs text-gray-500">Automated diagnostic routine reports optimum transaction processing times on primary pipeline links.</p>
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">AWS Europe</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Operational</span>
              </div>
            </div>
          </div>
        );

      case 'modal':
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-gray-900 rounded-xl shadow transition-colors"
            >
              Ouvrir l’alerte Sandbox
            </button>

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm">
                <div 
                  className={`p-6 max-w-md w-full border ${
                    selectedComponentVariant === 'cyberpunk'
                      ? 'border-pink-500 bg-white text-pink-500 font-mono rounded-none'
                      : 'border-gray-200 bg-gray-100 rounded-2xl shadow-xl'
                  }`}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">⚠ DANGER DE MERGE DE BRANCHE</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    Cette action va réécrire l'historique git. Les modifications locales non commitées seront perdues.
                  </p>
                  <div className="flex justify-end gap-2 text-xs">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="px-3 py-1.5 text-gray-500 hover:text-gray-900"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={() => {
                        setIsModalOpen(false);
                        addNotification('Rebasing launched successfully!', 'success');
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 text-gray-900 rounded-lg hover:bg-rose-500 font-semibold"
                    >
                      Confirmer la Mutation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <p className="text-xs text-gray-500 italic py-6">Selectionnez un composant interactif.</p>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      
      {/* LEFT COLUMN: Controls & Library List (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6 max-h-[82vh] overflow-y-auto pr-2">
        
        {/* Component Selector list */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Composants Disponibles</h2>
            <button
              onClick={() => setIsCreating(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600/20 border border-indigo-200 text-indigo-300 hover:text-gray-900 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              title="Créer un nouveau composant personnalisé"
            >
              <Plus size={12} />
              Nouveau
            </button>
          </div>

          {isCreating && (
            <form onSubmit={handleCreateCustomComponent} className="p-4 rounded-xl border border-gray-200 bg-white/60 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider block">Nouveau Composant</h3>
              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Nom du Composant</label>
                <input
                  type="text"
                  placeholder="Ex: StatsCard, HeaderMenu..."
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  required
          className="w-full text-xs px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
        />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Type de Blueprint</label>
                <select
                  value={newCompType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewCompType(e.target.value as 'button' | 'card' | 'modal')}
          className="w-full text-xs px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
        >
                  <option value="button">Bouton interactif</option>
                  <option value="card">Carte d'information (Card)</option>
                  <option value="modal">Fenêtre modale (Modal)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-gray-900 font-semibold rounded-lg shadow-md"
                >
                  Créer
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {componentLibrary.map((comp) => (
              <button
                key={comp.id}
                onClick={() => {
                  setSelectedComponent(comp);
                  setActiveTab('preview');
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                  selectedComponent?.id === comp.id
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-gray-900'
                    : 'bg-white/30 border-gray-200 text-gray-500 hover:text-gray-700'
                }`}
              >
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-0.5">{comp.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono">Category: {comp.type}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {comp.id.startsWith('custom-') && (
                    <button
                      onClick={(e) => handleDeleteCustomComponent(comp.id, e)}
                      className="p-1 rounded bg-red-950/20 hover:bg-red-900/40 text-red-600 hover:text-red-700 transition-colors"
                      title="Supprimer ce composant"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                  <ChevronRight size={14} className="opacity-50" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Variant selection & Design options */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2.5">Variante de Style</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'minimalist', label: 'Outline' },
              { id: 'cyberpunk', label: 'Neon' },
              { id: 'glass', label: 'Glass' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedComponentVariant(v.id)}
                className={`text-xs py-2 rounded-lg border text-center transition-all cursor-pointer ${
                  selectedComponentVariant === v.id
                    ? 'bg-indigo-50 border-indigo-500/30 text-indigo-300'
                    : 'bg-white/20 border-gray-200 text-gray-500 hover:text-gray-900'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom AI generator input panel */}
        <div className="p-6 rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-950/40 glow-indigo relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-yellow-400 animate-pulse" />
            Modifier le style par IA
          </h3>
          <p className="text-[11px] text-gray-500 mb-4 font-sans">
            Spécifiez de nouveaux gradients, textures ou icônes de marquage, et l'IA adaptera le code TSX.
          </p>
          <div className="space-y-3">
            <textarea
              placeholder="Ex: Utiliser un gradient orange et un contour en pointillé qui tourne lors du survol..."
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={3}
              className="w-full text-xs px-3.5 py-2.5 bg-white/60 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            {/* Quick Component Prompt Suggestion Pills */}
            <div>
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1.5 font-bold">Presets d'idées de UI</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Stats Hub Metric Card', prompt: 'Monthly operational balance card stats with green increase rate badge' },
                  { label: 'Terminal Core Panel', prompt: 'Developer interactive docker shell terminal logs container box' },
                  { label: 'Pro Billing Pricing', prompt: 'Modern Premium pricing tier features checkmark billing card' }
                ].map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptInput(pill.prompt);
                      addNotification(`Prompt configuré : "${pill.label}"`, 'info');
                    }}
                    className="px-2 py-1 text-[9px] bg-gray-100 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg border border-gray-200 transition-all cursor-pointer"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAIGenerateComponent}
              disabled={loadingComponentAI || !selectedComponent}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-gray-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {loadingComponentAI ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-900" />
                  Régénération IA en cours...
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-yellow-200" />
                  Lancer la compilation IA
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Code Editor (JetBrains Mono formatting) & Visualizer Sandbox (8 cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4 max-h-[82vh] border border-gray-200 rounded-2xl bg-slate-950/80 overflow-hidden text-left">
        
        {/* Output Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900/60 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-white/30 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'preview'
                  ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Eye size={13} />
              Bac à sable (Live)
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'code'
                  ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Code size={13} />
              Code Source TSX
            </button>
          </div>

          <button
            onClick={handleCopyCode}
            disabled={!selectedComponent}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-100 text-xs font-semibold rounded-xl text-gray-700 hover:text-gray-900 border border-gray-200 transition-colors cursor-pointer"
          >
            <Copy size={13} />
            Copier le code TSX
          </button>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'preview' ? (
            <div className="h-full flex flex-col justify-between">
              
              {/* Dynamic render block */}
              <div className="flex-1 flex items-center justify-center border border-gray-200 bg-slate-950/60 rounded-xl relative overflow-hidden min-h-[300px]">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                {getInteractiveComponentInstance()}
              </div>

              {/* Component Info Footer */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/40 border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 font-mono flex items-center gap-1.5">
                    <Activity size={12} className="text-blue-400" />
                    STATUS: READY FOR RENDERING
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Le bac à sable émule des props d’intégration à chaud et des états standard React v19.</p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded bg-amber-50 text-amber-500 border border-amber-200">
                  {selectedComponentVariant} style
                </span>
              </div>

            </div>
          ) : (
            <div className="font-mono text-sm h-full flex select-text">
              {/* Dynamic premium line numbers column */}
              <div className="text-gray-600 text-right pr-4 select-none border-r border-gray-200 text-xs font-mono min-w-[2.5rem] overflow-hidden">
                {Array.from({ length: Math.max((selectedComponent?.code?.split('\n').length || 1), 30) }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code container */}
              <div className="flex-1 pl-4 h-full">
                <textarea
                  value={selectedComponent?.code}
                  onChange={(e) => {
                    if (selectedComponent) {
                      updateComponentCode(selectedComponent.id, e.target.value);
                    }
                  }}
                  className="w-full h-full bg-transparent font-mono text-xs text-indigo-200 leading-relaxed border-none focus:outline-none resize-none cursor-text select-text scrollbar-thin"
                />
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
