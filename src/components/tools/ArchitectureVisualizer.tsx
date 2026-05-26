/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDevDockStore } from '../../store/devdockStore';
import { ProjectFileNode, ProjectArchitecture } from '../../types';
import { 
  Folder, 
  File, 
  Upload, 
  Network, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  AlertTriangle, 
  Cpu, 
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';

export default function ArchitectureVisualizer() {
  const {
    architectures,
    activeArchitecture,
    architectureSearch,
    selectedFileContent,
    setActiveArchitecture,
    uploadArchitectureZip,
    setArchitectureSearch,
    setSelectedFileContent,
    addArchitecture,
    deleteArchitecture,
    updateArchitecture,
    addNotification
  } = useDevDockStore();

  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({
    './src': true,
    './src/components': true,
    './src/services': true,
    '.': true,
    './components': true
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  const handleResetArchitecture = () => {
    const emptyProjId = 'custom-arch-' + Date.now();
    const emptyNode: ProjectFileNode = {
      name: 'Nouveau Projet',
      path: '.',
      type: 'directory',
      children: [
        { name: 'index.tsx', path: './index.tsx', type: 'file', size: 280, complexity: 'Low' },
        { name: 'App.tsx', path: './App.tsx', type: 'file', size: 620, complexity: 'Medium' },
        { name: 'components', path: './components', type: 'directory', children: [
          { name: 'Header.tsx', path: './components/Header.tsx', type: 'file', size: 410, complexity: 'Low' },
          { name: 'Button.tsx', path: './components/Button.tsx', type: 'file', size: 190, complexity: 'Low' }
        ]}
      ]
    };
    
    const newArch: ProjectArchitecture = {
      id: emptyProjId,
      name: 'Nouveau Projet Vierge',
      root: emptyNode,
      nodes: [
        { id: './index.tsx', label: 'index.tsx', group: 'ui' },
        { id: './App.tsx', label: 'App.tsx', group: 'ui' },
        { id: './components/Header.tsx', label: 'Header.tsx', group: 'ui' },
        { id: './components/Button.tsx', label: 'Button.tsx', group: 'ui' }
      ],
      links: [
        { source: './index.tsx', target: './App.tsx', type: 'import' },
        { source: './App.tsx', target: './components/Header.tsx', type: 'import' },
        { source: './App.tsx', target: './components/Button.tsx', type: 'import' }
      ],
      metrics: {
        totalFiles: 4,
        linesOfCode: 1500,
        avgComplexity: 'Low',
        unusedFiles: []
      }
    };
    
    addArchitecture(newArch);
    setSelectedFileContent({
      path: './App.tsx',
      content: `// Bienvenue dans votre nouvelle architecture !\n// Cliquez sur un fichier de l'explorateur pour afficher son code.`
    });

    setExpandedDirs(prev => ({
      ...prev,
      '.': true,
      './components': true
    }));

    addNotification('Nouvelle architecture vierge initialisée avec des fichiers de base !', 'success');
  };

  const handleDeleteArchitecture = (id: string) => {
    if (architectures.length <= 1) {
      addNotification('Impossible de supprimer la dernière architecture restante.', 'warning');
      return;
    }
    deleteArchitecture(id);
    addNotification('Architecture projet supprimée.', 'info');
  };

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Trigger simulated blueprint zip loading
  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsSimulatingUpload(true);
    addNotification(`Processing archive "${file.name}"...`, 'info');

    // Simulate analysis delay
    setTimeout(() => {
      // Simulate mapping of a custom parsed tree
      const rootNode: ProjectFileNode = {
        name: 'root',
        path: '.',
        type: 'directory',
        children: [
          { name: 'index.js', path: './index.js', type: 'file', size: 450, complexity: 'Low' },
          { name: 'App.jsx', path: './App.jsx', type: 'file', size: 1040, complexity: 'Medium' },
          { name: 'test-unused.js', path: './test-unused.js', type: 'file', size: 120, complexity: 'Low' },
          { name: 'utils.js', path: './utils.js', type: 'file', size: 890, complexity: 'Low' }
        ]
      };
      
      uploadArchitectureZip(file.name, rootNode);
      setIsSimulatingUpload(false);
      addNotification(`Project "${file.name}" analyzed successfully!`, 'success');
    }, 1500);
  };

  // Recursive explorer renderer
  const renderTreeNodes = (node: ProjectFileNode) => {
    // If search term exists, filter
    if (architectureSearch && !node.name.toLowerCase().includes(architectureSearch.toLowerCase()) && node.type === 'file') {
      return null;
    }

    if (node.type === 'directory') {
      const isExpanded = expandedDirs[node.path];
      return (
        <div key={node.path} className="pl-3.5">
          <button
            onClick={() => toggleDirectory(node.path)}
            className="flex items-center gap-1.5 py-1 text-xs text-gray-700 hover:text-gray-900 font-sans w-full text-left"
          >
            {isExpanded ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
            <Folder size={13} className="text-blue-400 fill-blue-400/20" />
            <span className="font-medium truncate">{node.name}</span>
          </button>
          
          {isExpanded && node.children && (
            <div className="border-l border-gray-200 ml-1.5 pl-1.5 space-y-0.5">
              {node.children.map(child => renderTreeNodes(child))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button
          key={node.path}
          onClick={() => {
            setSelectedFileContent({
              path: node.path,
              content: `// Source file: ${node.name}\n// File complexity index: ${node.complexity || 'Low'}\n// Total package size: ${node.size || 500} bytes\n\nimport React from 'react';\n\nexport default function ${node.name.split('.')[0]}() {\n  return (\n    <div>\n      <!-- Compiled in workspace -->\n    </div>\n  );\n}`
            });
            addNotification(`Viewing metadata for: ${node.name}`, 'info');
          }}
          className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-mono w-full text-left transition-colors truncate ${
            selectedFileContent?.path === node.path 
              ? 'bg-blue-600/10 text-blue-300 border border-blue-500/10' 
              : 'text-gray-500 hover:text-gray-200'
          }`}
        >
          <File size={12} className="text-gray-500" />
          <span>{node.name}</span>
          {node.complexity === 'High' && (
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">Complex</span>
          )}
        </button>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      
      {/* LEFT SECTION: Directory Explorer & Blueprint Loader (4 cols) */}
      <div className="xl:col-span-4 flex flex-col gap-6 max-h-[82vh] overflow-y-auto pr-2">
        
        {/* Project workspace switcher & archive uploader */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-white backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Workspace Projet</h2>
            <button
              onClick={handleResetArchitecture}
              className="flex items-center gap-1 bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/20 text-blue-300 hover:text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
              title="Créer une nouvelle architecture de projet"
            >
              <Plus size={12} />
              Nouveau
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1.5">Project Blueprint</label>
              <div className="flex gap-2">
                <select
                  value={activeArchitecture.id}
                  onChange={(e) => setActiveArchitecture(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900"
                >
                  {architectures.map(arch => (
                    <option key={arch.id} value={arch.id}>{arch.name}</option>
                  ))}
                </select>
                {activeArchitecture.id.startsWith('custom-') && (
                  <button
                    onClick={() => handleDeleteArchitecture(activeArchitecture.id)}
                    className="p-2 border border-red-500/30 bg-red-950/20 hover:bg-red-900/40 text-red-600 hover:text-red-300 rounded-xl transition-all"
                    title="Supprimer cette architecture"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Custom ZIP Archive Analyzer */}
            <div className="relative border border-dashed border-gray-200 rounded-xl bg-white/30 p-4 hover:bg-white/50 transition-colors">
              <input
                type="file"
                accept=".zip,.json"
                onChange={handleZipUpload}
                disabled={isSimulatingUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center text-center">
                {isSimulatingUpload ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mb-2" />
                    <span className="text-xs font-semibold text-gray-900">Analyse de l’arborescence...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-500 mb-2" />
                    <span className="text-xs text-gray-700 font-medium font-sans">Analyser mon ZIP (.zip)</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5">Glisser un fichier archive</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Directory Search & Hierarchy Tree */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-white backdrop-blur-md flex-1 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Explorateur de Code</h3>
            <span className="text-[10px] font-mono text-gray-500 uppercase">Blueprints files</span>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher des modules..."
              value={architectureSearch}
              onChange={(e) => setArchitectureSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white/60 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] bg-white/20 p-2.5 rounded-xl border border-gray-200 text-left">
            {renderTreeNodes(activeArchitecture.root)}
          </div>
        </div>

      </div>

      {/* RIGHT SECTION: SVG Interactive Mesh Canvas (8 cols) */}
      <div className="xl:col-span-8 flex flex-col gap-6 max-h-[82vh]">
        
        {/* SVG Interactive graph block */}
        <div className="relative flex-1 rounded-2xl border border-gray-200 bg-slate-950/70 overflow-hidden min-h-[350px]">
          {/* Background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          {/* Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-mono uppercase text-gray-500 flex items-center gap-1.5">
              <Network size={12} className="text-blue-400" />
              Graph de Dépendances
            </div>
            <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
                className="w-5 h-5 flex items-center justify-center text-xs text-gray-900 bg-gray-100 rounded hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-[10px] font-mono select-none px-1 text-gray-900">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.2))}
                className="w-5 h-5 flex items-center justify-center text-xs text-gray-900 bg-gray-100 rounded hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Canvas SVG */}
          <div className="w-full h-full flex items-center justify-center">
            <svg 
              className="transition-transform duration-300 w-full h-[380px]" 
              style={{ transform: `scale(${zoomLevel})` }}
              viewBox="0 0 800 400"
            >
              {/* Define arrows */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                </marker>
                
                {/* Glow filter definition for premium architectural feel */}
                <filter id="glow-node" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render links */}
              {activeArchitecture.links.map((link, i) => {
                const sourceNode = activeArchitecture.nodes.find(n => n.id === link.source);
                const targetNode = activeArchitecture.nodes.find(n => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                // Simple calculated custom SVG coordinates for demonstration
                const indexSource = activeArchitecture.nodes.indexOf(sourceNode);
                const indexTarget = activeArchitecture.nodes.indexOf(targetNode);
                
                const sx = 100 + (indexSource % 3) * 260;
                const sy = 80 + Math.floor(indexSource / 3) * 120;
                const tx = 100 + (indexTarget % 3) * 260;
                const ty = 80 + Math.floor(indexTarget / 3) * 120;

                return (
                  <g key={i}>
                    {/* Pulsing neon connection path backing */}
                    <line
                      x1={sx}
                      y1={sy}
                      x2={tx}
                      y2={ty}
                      stroke="rgba(99, 102, 241, 0.15)"
                      strokeWidth="4"
                      className="transition-all duration-300"
                    />
                    <line
                      x1={sx}
                      y1={sy}
                      x2={tx}
                      y2={ty}
                      stroke="#1e293b"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                      className="transition-all duration-300"
                    />
                    <text
                      x={(sx + tx) / 2}
                      y={(sy + ty) / 2 - 5}
                      fill="#4b5563"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {link.type}
                    </text>
                  </g>
                );
              })}

              {/* Render nodes */}
              {activeArchitecture.nodes.map((node, i) => {
                const x = 100 + (i % 3) * 260;
                const y = 80 + Math.floor(i / 3) * 120;
                
                const strokeColor = node.group === 'api' ? '#ff007f' : node.group === 'db' ? '#10b981' : '#3b82f6';
                const fillColor = node.group === 'api' ? 'rgba(255,0,127,0.1)' : node.group === 'db' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)';

                return (
                  <g key={node.id} className="cursor-pointer group">
                    {/* Glowing pulse backing underneath */}
                    <rect
                      x={x - 85}
                      y={y - 25}
                      width="170"
                      height="50"
                      rx="10"
                      fill="transparent"
                      stroke={strokeColor}
                      strokeWidth="5"
                      className="opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                      filter="url(#glow-node)"
                    />
                    {/* Main rect node */}
                    <rect
                      x={x - 85}
                      y={y - 25}
                      width="170"
                      height="50"
                      rx="10"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      className="transition-all duration-300 group-hover:stroke-white group-hover:fill-[#121927]"
                    />
                    <text
                      x={x}
                      y={y - 5}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="Inter"
                      textAnchor="middle"
                    >
                      {node.id}
                    </text>
                    <text
                      x={x}
                      y={y + 12}
                      fill="#9ca3af"
                      fontSize="9"
                      fontFamily="Inter"
                      textAnchor="middle"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* BOTTOM METRICS BANNER AND UNUSED FILE SCANNER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Complexity gauges */}
          <div className="md:col-span-4 p-5 rounded-2xl border border-gray-200 bg-white backdrop-blur-md flex items-center gap-4 text-left">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Cpu size={18} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Complexity Index</p>
              <h4 className="text-md font-bold font-sans text-gray-900 mt-0.5">{activeArchitecture.metrics.linesOfCode} Lines Of Code</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Rating: <span className="text-rose-400 font-bold font-mono">{activeArchitecture.metrics.avgComplexity}</span></p>
            </div>
          </div>

          {/* Leftover files analyzer warnings panel */}
          <div className="md:col-span-8 p-5 rounded-2xl border border-gray-200 bg-white backdrop-blur-md flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                <AlertTriangle size={18} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase font-sans">Analyse d'entretien : Fichiers inutilisés détectés</h4>
                {activeArchitecture.metrics.unusedFiles.length > 0 ? (
                  <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                    Safe to remove: {activeArchitecture.metrics.unusedFiles.join(', ')}
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-600 font-sans mt-0.5">
                    Excellent ! Aucun résidu de code détecté.
                  </p>
                )}
              </div>
            </div>
            
            {activeArchitecture.metrics.unusedFiles.length > 0 && (
              <button
                onClick={() => {
                  const updatedArch = {
                    ...activeArchitecture,
                    metrics: {
                      ...activeArchitecture.metrics,
                      unusedFiles: []
                    }
                  };
                  updateArchitecture(updatedArch);
                  addNotification('Nettoyage des fichiers effectué!', 'success');
                }}
                className="px-3 py-1.5 bg-amber-600/15 hover:bg-amber-600/30 text-amber-300 font-semibold rounded-lg text-[10px] transition-colors cursor-pointer border border-amber-500/20"
              >
                Tout Nettoyer
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
