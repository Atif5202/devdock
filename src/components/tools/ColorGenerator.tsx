/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useDevDockStore } from '../../store/devdockStore';
import { ColorPalette } from '../../types';
import { 
  Sparkles, 
  Copy, 
  Heart, 
  RotateCw, 
  Sliders, 
  Zap,
  Plus
} from 'lucide-react';

export default function ColorGenerator() {
  const {
    activePalette,
    paletteHistory,
    loadingPaletteAI,
    setActivePalette,
    addToHistory,
    setLoadingPaletteAI,
    toggleFavoritePalette,
    addNotification
  } = useDevDockStore();

  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedExportTab, setSelectedExportTab] = useState<'tailwind' | 'css' | 'json'>('tailwind');

  // Simple Hex validation helper
  const isValidHex = (hex: string) => /^#[0-9A-F]{6}$/i.test(hex);

  // Generate harmonized complementary color automatically
  const calculateComplimentary = (hex: string): string => {
    if (!isValidHex(hex)) return '#10b981';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const compR = (255 - r).toString(16).padStart(2, '0');
    const compG = (255 - g).toString(16).padStart(2, '0');
    const compB = (255 - b).toString(16).padStart(2, '0');
    return `#${compR}${compG}${compB}`;
  };

  const handleBaseColorChange = (hex: string) => {
    if (!isValidHex(hex)) return;
    const computedSec = calculateComplimentary(hex);
    setActivePalette({
      primary: hex,
      secondary: computedSec,
      accent: '#6366f1' // Stable anchor accent
    });
  };

  // Contrast Accessibility score (Relative Luminance check)
  const getContrastRatio = (color1: string, color2: string) => {
    const getRGB = (hex: string) => {
      let clean = hex.replace('#', '');
      if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
      }
      return {
        r: parseInt(clean.substring(0, 2), 16) / 255,
        g: parseInt(clean.substring(2, 4), 16) / 255,
        b: parseInt(clean.substring(4, 6), 16) / 255,
      };
    };

    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const a = [rgb.r, rgb.g, rgb.b].map((v) => {
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    try {
      const l1 = getLuminance(getRGB(color1)) + 0.05;
      const l2 = getLuminance(getRGB(color2)) + 0.05;
      return l1 > l2 ? l1 / l2 : l2 / l1;
    } catch {
      return 1;
    }
  };

  const textContrastRatio = getContrastRatio(activePalette.background, activePalette.text);
  const primaryContrastRatio = getContrastRatio(activePalette.primary, '#ffffff');

  const getWCAGScore = (ratio: number) => {
    if (ratio >= 7) return { text: 'AAA Excellent', color: 'text-emerald-600' };
    if (ratio >= 4.5) return { text: 'AA Optimal', color: 'text-emerald-500' };
    if (ratio >= 3) return { text: 'Large Text Pass', color: 'text-amber-400' };
    return { text: 'Low Contrast Warning', color: 'text-rose-400' };
  };

  const textScore = getWCAGScore(textContrastRatio);
  const primaryScore = getWCAGScore(primaryContrastRatio);

  const handleCopyValue = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    addNotification(`${label} hex copied: ${val}`, 'success');
  };

  const handleResetPalette = () => {
    setActivePalette({
      name: 'Nouveau thème personnalisé',
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#6366f1',
      background: '#090d16',
      surface: '#111827',
      text: '#f3f4f6'
    });
    addNotification('Nouvelles couleurs vierges initialisées !', 'success');
  };

  // AI Prompt Call
  const handleAIPaletteGenerate = async () => {
    if (!aiPrompt) {
      addNotification('Veuillez spécifier un mot-clef pour l’IA', 'warning');
      return;
    }
    setLoadingPaletteAI(true);
    addNotification('Calculateur de palette en cours...', 'info');

    try {
      const resp = await fetch('/api/ai/palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiPrompt })
      });

      if (!resp.ok) {
        throw new Error('API key missing or lookup error');
      }

      const data = await resp.json();
      const loadedPalette = {
        id: 'ai-' + Date.now(),
        name: data.name || 'AI generated',
        primary: data.primary,
        secondary: data.secondary,
        accent: data.accent,
        background: data.background,
        surface: data.surface,
        text: data.text,
        isFavorite: false
      };

      setActivePalette(loadedPalette);
      addToHistory(loadedPalette);
      addNotification(`Nouvelle palette générée : ${loadedPalette.name}!`, 'success');
    } catch (err) {
      console.warn('API lookup failed, switching to premium local simulation engine...', err);
      
      // Smart intelligent fallback generation based on keyword weights
      const lowercasePrompt = aiPrompt.toLowerCase();
      let simPalette: {
        name: string;
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
      };

      if (lowercasePrompt.includes('notion') || lowercasePrompt.includes('slate') || lowercasePrompt.includes('minimal')) {
        simPalette = {
          name: 'Notion Minimalist Slate',
          primary: '#475569',
          secondary: '#334155',
          accent: '#94a3b8',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc'
        };
      } else if (lowercasePrompt.includes('cyber') || lowercasePrompt.includes('synth') || lowercasePrompt.includes('neon') || lowercasePrompt.includes('vaporwave')) {
        simPalette = {
          name: 'Neon Cyberpunk Skyline',
          primary: '#ff007f',
          secondary: '#7000ff',
          accent: '#00f0ff',
          background: '#040209',
          surface: '#120822',
          text: '#f8fafc'
        };
      } else if (lowercasePrompt.includes('forest') || lowercasePrompt.includes('matcha') || lowercasePrompt.includes('green') || lowercasePrompt.includes('nature')) {
        simPalette = {
          name: 'Forest Matcha Zen',
          primary: '#10b981',
          secondary: '#047857',
          accent: '#34d399',
          background: '#05110c',
          surface: '#0d2218',
          text: '#f2fcf7'
        };
      } else if (lowercasePrompt.includes('coffee') || lowercasePrompt.includes('espresso') || lowercasePrompt.includes('warm') || lowercasePrompt.includes('amber')) {
        simPalette = {
          name: 'Cozy Espresso & Cream',
          primary: '#b45309',
          secondary: '#78350f',
          accent: '#f59e0b',
          background: '#0c0703',
          surface: '#1b120a',
          text: '#fffbeb'
        };
      } else if (lowercasePrompt.includes('sunset') || lowercasePrompt.includes('rose') || lowercasePrompt.includes('peach')) {
        simPalette = {
          name: 'Warm Sunset Glow',
          primary: '#f43f5e',
          secondary: '#be123c',
          accent: '#f97316',
          background: '#110508',
          surface: '#200b11',
          text: '#ffeef1'
        };
      } else if (lowercasePrompt.includes('terminal') || lowercasePrompt.includes('matrix')) {
        simPalette = {
          name: 'Matrix Retro Terminal',
          primary: '#22c55e',
          secondary: '#15803d',
          accent: '#4ade80',
          background: '#010502',
          surface: '#051b0b',
          text: '#e8faee'
        };
      } else {
        // Fallback default dynamic matching — generates hex values directly
        const hash = aiPrompt.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const hue = hash % 360;
        const hslToHex = (h: number, s: number, l: number) => {
          s /= 100;
          l /= 100;
          const a = s * Math.min(l, 1 - l);
          const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
          };
          return `#${f(0)}${f(8)}${f(4)}`;
        };
        simPalette = {
          name: `${aiPrompt.substring(0, 16)} Custom`,
          primary: hslToHex(hue, 85, 55),
          secondary: hslToHex((hue + 40) % 360, 90, 45),
          accent: hslToHex((hue + 180) % 360, 95, 60),
          background: hslToHex((hue + 20) % 360, 40, 6),
          surface: hslToHex((hue + 20) % 360, 30, 11),
          text: '#fafafa'
        };
      }

      const finalPalette = {
        id: 'sim-' + Date.now(),
        name: simPalette.name,
        primary: simPalette.primary,
        secondary: simPalette.secondary,
        accent: simPalette.accent,
        background: simPalette.background,
        surface: simPalette.surface,
        text: simPalette.text,
        isFavorite: false
      };

      setActivePalette(finalPalette);
      addToHistory(finalPalette);
      addNotification(`[Simulation Locale Active] Palette générée pour "${aiPrompt}"`, 'info');
    } finally {
      setLoadingPaletteAI(false);
    }
  };

  // Presets trigger
  const applyPreset = (palette: ColorPalette) => {
    setActivePalette(palette);
    addNotification(`Theme "${palette.name}" configuré!`, 'info');
  };

  // Copy complete config snippet
  const getTailwindConfig = () => {
    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        devdock: {
          primary: '${activePalette.primary}',
          secondary: '${activePalette.secondary}',
          accent: '${activePalette.accent}',
          background: '${activePalette.background}',
          surface: '${activePalette.surface}',
          text: '${activePalette.text}',
        }
      }
    }
  }
}`;
  };

  const getCSSVariables = () => {
    return `:root {
  --brand-primary: ${activePalette.primary};
  --brand-secondary: ${activePalette.secondary};
  --brand-accent: ${activePalette.accent};
  --brand-background: ${activePalette.background};
  --brand-surface: ${activePalette.surface};
  --brand-text: ${activePalette.text};
}`;
  };

  const getJSONSchema = () => {
    return JSON.stringify({
      themeName: activePalette.name,
      colors: {
        primary: activePalette.primary,
        secondary: activePalette.secondary,
        accent: activePalette.accent,
        background: activePalette.background,
        surface: activePalette.surface,
        text: activePalette.text
      }
    }, null, 2);
  };

  const handleCopyConfig = () => {
    let snippet = '';
    if (selectedExportTab === 'tailwind') snippet = getTailwindConfig();
    if (selectedExportTab === 'css') snippet = getCSSVariables();
    if (selectedExportTab === 'json') snippet = getJSONSchema();

    navigator.clipboard.writeText(snippet);
    addNotification('Config theme block copie!', 'success');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      
      {/* LEFT SECTION: Picker & Sliders (5 cols) */}
      <div className="xl:col-span-5 flex flex-col gap-6 max-h-[82vh] overflow-y-auto pr-2">
        
        {/* Color Palette Header & Quick AI Generation */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sliders size={20} className="text-emerald-600" />
              Theme Design Studio
            </h2>
            <button
              onClick={handleResetPalette}
              className="flex items-center gap-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-200 text-emerald-300 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
              title="Créer un nouveau thème personnalisé à partir de zéro"
            >
              <Plus size={12} />
              Nouveau
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4 font-sans">Ajustez les harmonies chromatiques ou demandez à l&#39;intelligence artificielle de composer à votre place.</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Minimalist Notion Slate dev dark..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAIPaletteGenerate}
              disabled={loadingPaletteAI}
              className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-gray-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {loadingPaletteAI ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} />
                  Générer
                </>
              )}
            </button>
          </div>

          {/* Quick Inspiring Prompts */}
          <div className="mt-3.5">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-2 font-bold">Suggestions d'inspiration</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Notion Minimal Slate', text: 'Minimalist Notion Slate dev dark' },
                { label: 'Neon Cyberpunk Skyline', text: 'Neon Cyberpunk Synthwave digital city' },
                { label: 'Forest Matcha Zen', text: 'Forest Nature Matcha green organic brand' },
                { label: 'Cozy Espresso', text: 'Warm Cozy Espresso Coffee Amber theme' },
                { label: 'Warm Sunset Glow', text: 'Warm Sunset Glow Peach Red Rose' }
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiPrompt(pill.text);
                    addNotification(`Prompt sélectionné : "${pill.label}"`, 'info');
                  }}
                  className="px-2.5 py-1 text-[10px] bg-gray-100 hover:bg-gray-200 hover:text-gray-900 text-gray-500 rounded-lg border border-gray-200 cursor-pointer transition-all"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color Value Blocks Edit Panel */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md space-y-4">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Ajuster les Variables Individuelles</h3>
          
          <div className="space-y-3">
            {[
              { label: 'Primary (Action)', key: 'primary' },
              { label: 'Secondary (Hover)', key: 'secondary' },
              { label: 'Accent Highlight', key: 'accent' },
              { label: 'Background Dark Canvas', key: 'background' },
              { label: 'Surface Card Block', key: 'surface' },
              { label: 'Text Core Title', key: 'text' },
            ].map((item) => (
              <motion.div 
                key={item.key} 
                whileHover={{ y: -2, scale: 1.015, borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/40 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={(activePalette as unknown as Record<string, string>)[item.key]}
                    onChange={(e) => {
                      const updatedValue = e.target.value;
                      if (item.key === 'primary') {
                        handleBaseColorChange(updatedValue);
                      } else {
                        setActivePalette({ [item.key]: updatedValue });
                      }
                    }}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer overflow-hidden bg-transparent"
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-900 font-sans">{item.label}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{(activePalette as unknown as Record<string, string>)[item.key]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={(activePalette as unknown as Record<string, string>)[item.key]}
                    onChange={(e) => setActivePalette({ [item.key]: e.target.value })}
                    className="w-20 text-center text-xs font-mono px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
                  />
                  <button
                    onClick={() => handleCopyValue((activePalette as unknown as Record<string, string>)[item.key], item.label)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 rounded bg-gray-100"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Accessibility contrast metrics */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Zap size={14} className="text-yellow-400" />
            Indicateurs d'accessibilité (WCAG 2.1)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/40 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 font-sans">Text on BG Contrast</p>
              <h4 className="text-lg font-mono font-bold mt-1 text-gray-900">{textContrastRatio.toFixed(2)}:1</h4>
              <p className={`text-[11px] font-medium mt-1 ${textScore.color}`}>
                ● {textScore.text}
              </p>
            </div>
            <div className="p-3 bg-white/40 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 font-sans">Primary on White Contrast</p>
              <h4 className="text-lg font-mono font-bold mt-1 text-gray-900">{primaryContrastRatio.toFixed(2)}:1</h4>
              <p className={`text-[11px] font-medium mt-1 ${primaryScore.color}`}>
                ● {primaryScore.text}
              </p>
            </div>
          </div>
        </div>

        {/* Preset history selection */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Bibliothèque de Presets</h3>
          <div className="grid grid-cols-2 gap-3">
            {paletteHistory.map((palette) => (
              <div
                key={palette.id}
                onClick={() => applyPreset(palette)}
                className={`p-3 rounded-xl border cursor-pointer hover:border-emerald-500/50 transition-all ${
                  activePalette.id === palette.id ? 'bg-emerald-50 border-emerald-500/30' : 'bg-white/30 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-gray-900 truncate w-4/5 font-sans">{palette.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoritePalette(palette.id);
                    }}
                    className="text-gray-500 hover:text-rose-400"
                  >
                    <Heart size={11} className={palette.isFavorite ? "fill-rose-500 text-rose-500" : ""} />
                  </button>
                </div>
                {/* Horizontal mini shades */}
                <div className="flex h-2.5 rounded overflow-hidden">
                  <div className="flex-1" style={{ backgroundColor: palette.primary }} />
                  <div className="flex-1" style={{ backgroundColor: palette.secondary }} />
                  <div className="flex-1" style={{ backgroundColor: palette.accent }} />
                  <div className="flex-1" style={{ backgroundColor: palette.background }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT SECTION: Export Snippets & LIVE SaaS Dashboard (7 cols) */}
      <div className="xl:col-span-7 flex flex-col gap-6 max-h-[82vh] overflow-y-auto pr-1">
        
        {/* Live UI rendering showcase */}
        <div 
          className="rounded-2xl border border-gray-200 p-6 shadow-2xl relative overflow-hidden transition-all duration-500"
          style={{ backgroundColor: activePalette.background }}
        >
          {/* Visual abstract glows */}
          <div 
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: activePalette.primary }}
          />

          <div className="flex items-center justify-between border-b pb-4 mb-4 border-gray-200">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-mono text-gray-500 font-bold">RECONSTITUTION SaaS LIVE PREVIEW</p>
              <h3 className="text-md font-bold text-gray-900 font-sans">Aperçu en temps réel : {activePalette.name}</h3>
            </div>
            <span 
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${activePalette.primary}20`, color: activePalette.primary }}
            >
              Mode premium
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Sidebar Mock */}
            <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: activePalette.surface, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: activePalette.primary }} />
                <span className="text-xs font-mono font-bold text-gray-900">DevDock</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="px-2 py-1 rounded font-medium text-gray-900" style={{ backgroundColor: `${activePalette.primary}15`, color: activePalette.primary }}>
                  Dashboard (Active)
                </div>
                <div className="px-2 py-1 rounded text-gray-500">Settings API</div>
                <div className="px-2 py-1 rounded text-gray-500">Logs Monitor</div>
              </div>
            </div>

            {/* Content Mock */}
            <div className="md:col-span-2 space-y-4">
              
              <div className="p-4 rounded-xl text-left" style={{ backgroundColor: activePalette.surface, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p className="text-[10px] text-gray-500">Current active quota balance</p>
                <h4 className="text-2xl font-bold font-mono text-gray-900 mt-1">12,410 requests</h4>
                <div className="w-full h-1.5 rounded-full bg-white/5 mt-3 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: activePalette.primary }} />
                </div>
              </div>

              {/* Interaction elements */}
              <div className="flex gap-2">
                <button 
                  className="flex-1 py-2 font-semibold text-xs rounded-xl shadow-lg shadow-white/5 text-gray-900 transition-opacity"
                  style={{ backgroundColor: activePalette.primary }}
                >
                  Action Principale
                </button>
                <button 
                  className="flex-1 py-2 font-semibold text-xs rounded-xl text-gray-900 transition-opacity border"
                  style={{ borderColor: activePalette.primary, backgroundColor: `${activePalette.primary}10` }}
                >
                  Option secondaire
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Configuration exporting box */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Exportation du code</h3>
            <button
              onClick={handleCopyConfig}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-slate-750 text-xs font-semibold rounded-lg text-gray-900 transition-colors cursor-pointer"
            >
              <Copy size={12} />
              Copier la configuration
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            {[
              { id: 'tailwind', label: 'Tailwind configuration' },
              { id: 'css', label: 'CSS Custom variables' },
              { id: 'json', label: 'JSON Preset structure' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedExportTab(tab.id as 'tailwind' | 'css' | 'json')}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all ${
                  selectedExportTab === tab.id
                    ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/20 border-gray-200 text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-gray-200">
            <pre className="text-xs font-mono text-gray-700 text-left overflow-x-auto leading-relaxed">
              {selectedExportTab === 'tailwind' && getTailwindConfig()}
              {selectedExportTab === 'css' && getCSSVariables()}
              {selectedExportTab === 'json' && getJSONSchema()}
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
}
