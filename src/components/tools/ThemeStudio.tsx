/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useDevDockStore } from '../../store/devdockStore';
import { 
  Copy, 
  TrendingUp, 
  DollarSign, 
  Server, 
  Users, 
  Plus,
  Download
} from 'lucide-react';

export default function ThemeStudio() {
  const {
    activePalette,
    setActivePalette,
    addNotification
  } = useDevDockStore();

  const handleResetThemeStudio = () => {
    setActivePalette({
      id: 'ts-custom-' + Date.now(),
      name: 'Nouveau Thème Vierge',
      primary: '#6366f1',
      secondary: '#10b981',
      accent: '#f43f5e',
      background: '#090d16',
      surface: '#111827',
      text: '#f3f4f6'
    });
    addNotification('Nouveau thème de studio SaaS réinitialisé !', 'success');
  };

  const handleDownloadCSS = () => {
    const cssContent = `/* 
 * Theme Name: ${activePalette.name || 'SaaS Workspace Theme'}
 * Generated via DevDock Interactive Studio
 */

:root {
  --brand-primary: ${activePalette.primary};
  --brand-secondary: ${activePalette.secondary};
  --brand-accent: ${activePalette.accent};
  --brand-background: ${activePalette.background};
  --brand-surface: ${activePalette.surface};
  --brand-text: ${activePalette.text};
}`;
    
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const slugName = (activePalette.name || 'theme')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
      
    link.download = `${slugName || 'theme'}.css`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addNotification(`Fichier ${slugName || 'theme'}.css téléchargé avec succès !`, 'success');
  };

  const [activeThemePreset, setActiveThemePreset] = useState<'saas-ocean' | 'cyberpunk' | 'terminal' | 'vercel'>('saas-ocean');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const applyPresetTheme = (preset: typeof activeThemePreset) => {
    setActiveThemePreset(preset);
    if (preset === 'saas-ocean') {
      setActivePalette({
        id: 'ts-ocean',
        name: 'SaaS Slate Ocean',
        primary: '#3b82f6',
        secondary: '#10b981',
        accent: '#6366f1',
        background: '#090d16',
        surface: '#111827',
        text: '#f3f4f6'
      });
    } else if (preset === 'cyberpunk') {
      setActivePalette({
        id: 'ts-cyber',
        name: 'Neon Cyberpunk',
        primary: '#ff007f',
        secondary: '#00f0ff',
        accent: '#f59e0b',
        background: '#08040d',
        surface: '#150920',
        text: '#ffffff'
      });
    } else if (preset === 'terminal') {
      setActivePalette({
        id: 'ts-terminal',
        name: 'Emerald Terminal',
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: '#020d0a',
        surface: '#061a15',
        text: '#e6fff0'
      });
    } else {
      setActivePalette({
        id: 'ts-vercel',
        name: 'Vercel Pitch Black',
        primary: '#ffffff',
        secondary: '#6b7280',
        accent: '#2563eb',
        background: '#000000',
        surface: '#0a0a0a',
        text: '#f3f4f6'
      });
    }
    addNotification(`Theme Preset "${preset.toUpperCase()}" loaded!`, 'success');
  };

  const handleCopyCodeSnippet = (format: string) => {
    let snippet: string;
    
    if (format === 'tailwind') {
      snippet = `// tailwind.config.js\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n          primary: '${activePalette.primary}',\n          secondary: '${activePalette.secondary}',\n          accent: '${activePalette.accent}',\n          background: '${activePalette.background}',\n          surface: '${activePalette.surface}',\n          text: '${activePalette.text}'\n        }\n      }\n    }\n  }\n}`;
    } else if (format === 'css') {
      snippet = `:root {\n  --brand-primary: ${activePalette.primary};\n  --brand-secondary: ${activePalette.secondary};\n  --brand-accent: ${activePalette.accent};\n  --brand-background: ${activePalette.background};\n  --brand-surface: ${activePalette.surface};\n  --brand-text: ${activePalette.text};\n}`;
    } else {
      snippet = `{\n  "themeName": "${activePalette.name}",\n  "primary": "${activePalette.primary}",\n  "secondary": "${activePalette.secondary}",\n  "accent": "${activePalette.accent}",\n  "background": "${activePalette.background}",\n  "surface": "${activePalette.surface}"\n}`;
    }

    navigator.clipboard.writeText(snippet);
    addNotification(`${format.toUpperCase()} setup block exported!`, 'success');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      
      {/* LEFT COLUMN: Theme Customizers & Controls (4 cols) */}
      <div className="xl:col-span-4 flex flex-col gap-6 max-h-[82vh] overflow-y-auto pr-2 text-left">
        
        {/* Presets Choice Box */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Thèmes SaaS Prédéfinis</h2>
            <button
              onClick={handleResetThemeStudio}
              className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-600/20 border border-indigo-200 text-indigo-600 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
              title="Créer un nouveau thème de base à blanc"
            >
              <Plus size={11} /> Nouveau
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'saas-ocean', label: 'Slate Ocean' },
              { id: 'cyberpunk', label: 'Neon Cyber' },
              { id: 'terminal', label: 'Emerald' },
              { id: 'vercel', label: 'Monochrome' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => applyPresetTheme(p.id as 'saas-ocean' | 'cyberpunk' | 'terminal' | 'vercel')}
                className={`relative py-3 px-3.5 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                  activeThemePreset === p.id
                    ? 'border-indigo-500/40 text-gray-900 shadow-xl shadow-indigo-500/5'
                    : 'bg-white/30 border-gray-200 text-gray-500 hover:text-gray-900'
                }`}
              >
                {activeThemePreset === p.id && (
                  <motion.div
                    layoutId="activeThemePresetBackground"
                    className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  />
                )}
                <span className="relative z-10">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic contrast toggle switch */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Répartition Lumineuse Contrastée</h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <p className="text-xs text-gray-900 font-medium font-sans">Dark / Light contrastée</p>
              <p className="text-[10px] text-gray-500 font-sans">Forcer l'ajustement du contraste double</p>
            </div>
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                if (isDarkMode) {
                  // Swap core back and surface to light settings
                  setActivePalette({
                    background: '#f8fafc',
                    surface: '#ffffff',
                    text: '#0f172a'
                  });
                } else {
                  // Restore dark
                  setActivePalette({
                    background: '#090d16',
                    surface: '#111827',
                    text: '#f3f4f6'
                  });
                }
                addNotification('Visuels contrastes réajustés !', 'info');
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                isDarkMode ? 'bg-indigo-600' : 'bg-gray-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Code installation exporter */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Export d'environnements</h3>
          
          <div className="space-y-2.5">
            {[
              { format: 'tailwind', label: 'Tailwind config module', desc: 'Direct inject on screens config colors block' },
              { format: 'css', label: 'CSS variables block', desc: 'Sits cleanly in global root styles sheets' },
              { format: 'json', label: 'JSON parameters metadata', desc: 'Backup and restore structure instantly' }
            ].map(item => (
              <div key={item.format} className="p-3 bg-white/30 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 font-sans">{item.label}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-sans leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.format === 'css' && (
                    <button
                      onClick={handleDownloadCSS}
                      className="p-1.5 rounded bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-200 text-indigo-600 hover:text-gray-900 cursor-pointer transition-colors"
                      title="Télécharger le fichier .css"
                    >
                      <Download size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyCodeSnippet(item.format)}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                    title={`Copier le code ${item.format.toUpperCase()}`}
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Highly immersive live simulated SaaS Dashboard (8 cols) */}
      <div className="xl:col-span-8 flex flex-col gap-6 max-h-[82vh] overflow-y-auto pr-1">
        
        {/* Full Interactive Live Preview Dashboard Frame */}
        <motion.div 
          className="rounded-2xl border p-5 md:p-6 shadow-2xl relative overflow-hidden text-left"
          animate={{ 
            backgroundColor: activePalette.background, 
            color: activePalette.text,
            borderColor: `${activePalette.primary}20`
          }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          layout
        >
          {/* Top visual background glow */}
          <motion.div 
            className="absolute -top-16 -left-16 w-52 h-52 rounded-full blur-3xl opacity-15 pointer-events-none"
            animate={{ backgroundColor: activePalette.primary }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          />
 
          {/* SaaS Header */}
          <div className="flex items-center justify-between border-b pb-5 mb-5 border-gray-200">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-900 font-bold text-sm shadow-md"
                animate={{ backgroundColor: activePalette.primary }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
              >
                D
              </motion.div>
              <div>
                <motion.h3 
                  className="text-sm font-bold font-sans"
                  animate={{ color: activePalette.text }}
                >
                  Enterprise Cloud Suite
                </motion.h3>
                <p className="text-[9px] text-gray-500 font-mono tracking-wider">Workspace: Production-Primary</p>
              </div>
            </div>
 
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-semibold text-emerald-500 uppercase tracking-wider">Cluster Optimal</span>
            </div>
          </div>
 
          {/* Stats strip cards metric widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {[
              { label: 'Revenus Actuels (SaaS)', val: '$34,210', icon: DollarSign, change: '+12.5%' },
              { label: 'Latency Node overhead', val: '4.2 ms', icon: Server, change: '-4.1%' },
              { label: 'Active billing clients', val: '1,424 users', icon: Users, change: '+88 new' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                className="p-5 rounded-xl border shadow-md text-left font-sans flex flex-col justify-between"
                animate={{ 
                  backgroundColor: activePalette.surface,
                  borderColor: `${activePalette.primary}12`
                }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                layout
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider font-sans">{stat.label}</span>
                  <motion.div 
                    className="p-2 rounded-lg text-gray-900 shadow-sm" 
                    animate={{ backgroundColor: `${activePalette.primary}20`, color: activePalette.primary }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  >
                    <stat.icon size={12} />
                  </motion.div>
                </div>
                <div>
                  <motion.h4 
                    className="text-lg font-bold font-mono tracking-tight leading-none"
                    animate={{ color: activePalette.text }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.val}
                  </motion.h4>
                  <p className="text-[10px] font-bold text-emerald-500 font-mono mt-1.5 flex items-center gap-1">
                    <TrendingUp size={10} />
                    {stat.change}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
 
          {/* Middle Recharts Vector curve widget and components sampler mockup */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            
            {/* Smooth SVG vector metric graph (8 cols) */}
            <motion.div 
              className="md:col-span-8 p-5 rounded-xl border text-left flex flex-col justify-between"
              animate={{ 
                backgroundColor: activePalette.surface,
                borderColor: `${activePalette.primary}12`
              }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              layout
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <motion.h4 
                    className="text-xs font-bold font-sans"
                    animate={{ color: activePalette.text }}
                  >
                    Volume d'appels API journaliers
                  </motion.h4>
                  <p className="text-[9px] text-slate-400 font-mono tracking-wide mt-0.5">Total metric requests processed over 7 days</p>
                </div>
                <motion.span 
                  className="text-[9px] font-mono py-0.5 px-2 rounded-full font-bold uppercase tracking-wider border border-current" 
                  animate={{ backgroundColor: `${activePalette.primary}15`, color: activePalette.primary }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                >
                  Realtime
                </motion.span>
              </div>
 
              {/* Precise responsive SVG path graph */}
              <div className="w-full h-36 flex items-end pt-2">
                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Dynamic Gradient Area underneath curves */}
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <motion.stop 
                        offset="0%" 
                        animate={{ stopColor: activePalette.primary }} 
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        stopOpacity="0.18" 
                      />
                      <motion.stop 
                        offset="100%" 
                        animate={{ stopColor: activePalette.primary }} 
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                        stopOpacity="0.0" 
                      />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d="M0 110 Q50 40, 100 80 T200 30 T300 90 T400 20 L400 120 L0 120 Z"
                    fill="url(#curveGrad)"
                  />
                  
                  <motion.path
                    d="M0 110 Q50 40, 100 80 T200 30 T300 90 T400 20"
                    fill="none"
                    animate={{ stroke: activePalette.primary }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    strokeWidth="2.5"
                  />
 
                  {/* Marker dots */}
                  <motion.circle 
                    cx="100" 
                    cy="80" 
                    r="4.5" 
                    fill="#ffffff" 
                    animate={{ stroke: activePalette.primary }} 
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    strokeWidth="2.5" 
                  />
                  <motion.circle 
                    cx="200" 
                    cy="30" 
                    r="4.5" 
                    fill="#ffffff" 
                    animate={{ stroke: activePalette.primary }} 
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    strokeWidth="2.5" 
                  />
                </svg>
              </div>
            </motion.div>
 
            {/* Inputs controls mockup (4 cols) */}
            <motion.div 
              className="md:col-span-4 p-5 rounded-xl border flex flex-col justify-between text-left"
              animate={{ 
                backgroundColor: activePalette.surface,
                borderColor: `${activePalette.primary}12`
              }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              layout
            >
              <motion.h4 
                className="text-xs font-bold uppercase tracking-wider font-sans mb-3"
                animate={{ color: activePalette.text }}
              >
                Composants Formulaire
              </motion.h4>
              
              <div className="space-y-3 font-sans w-full">
                <motion.input
                  type="text"
                  placeholder="Interactive Input text..."
                  readOnly
                  className="w-full text-xs px-3 py-2 bg-white/25 border rounded-lg placeholder-slate-500 focus:outline-none"
                  animate={{ 
                    borderColor: `${activePalette.primary}25`,
                    color: activePalette.text 
                  }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                />
 
                <motion.button 
                  className="w-full py-2 font-semibold text-xs rounded-lg text-gray-900 transition-opacity shadow cursor-pointer hover:opacity-90"
                  animate={{ backgroundColor: activePalette.primary }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                >
                  Solid trigger btn
                </motion.button>
 
                <motion.button 
                  className="w-full py-2 font-semibold text-xs rounded-lg border text-center cursor-pointer hover:opacity-90"
                  animate={{ borderColor: activePalette.primary, backgroundColor: `${activePalette.primary}10`, color: activePalette.primary }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                >
                  Outline action
                </motion.button>
              </div>
            </motion.div>
 
          </div>
 
          <motion.div 
            className="p-5 rounded-xl border text-left overflow-x-auto"
            animate={{ 
              backgroundColor: activePalette.surface,
              borderColor: `${activePalette.primary}12`
            }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            layout
          >
              <motion.h4 
                className="text-xs font-bold mb-4 font-sans"
                animate={{ color: activePalette.text }}
              >
                Moniteur de requêtes serveur
              </motion.h4>
              
              <table className="w-full text-left font-mono text-[11px] leading-relaxed">
                <thead>
                  <tr className="border-b border-gray-200 text-slate-500">
                    <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px] text-slate-400">Method</th>
                    <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px] text-slate-400">Route URL</th>
                    <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px] text-slate-400">Status code</th>
                    <th className="pb-2.5 font-bold uppercase tracking-wider text-[9px] text-slate-400">Overhead</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { m: 'POST', r: '/api/v1/auth/token_verify', s: '200 OK', d: '1.2 ms', sc: 'bg-emerald-50 text-emerald-500 border border-emerald-200 font-bold' },
                    { m: 'GET', r: '/api/v1/clusters/diagnostic', s: '200 OK', d: '4.8 ms', sc: 'bg-emerald-50 text-emerald-500 border border-emerald-200 font-bold' },
                    { m: 'POST', r: '/api/v1/schema/db_mutation', s: '403 DENIED', d: '0.1 ms', sc: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <motion.td 
                        className="py-3 font-bold" 
                        animate={{ color: activePalette.primary }}
                        transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      >
                        {row.m}
                      </motion.td>
                      <motion.td 
                        className="py-3 text-slate-300"
                        animate={{ color: isDarkMode ? '#cbd5e1' : '#334155' }}
                      >
                        {row.r}
                      </motion.td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${row.sc}`}>
                          {row.s}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono">{row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </motion.div>
 
        </motion.div>
 
      </div>

    </div>
  );
}
