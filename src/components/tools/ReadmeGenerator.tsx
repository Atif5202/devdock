/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDevDockStore } from '../../store/devdockStore';
import MarkdownRenderer from '../MarkdownRenderer';
import { ReadmeSection } from '../../types';
import { 
  Copy, 
  Download, 
  Sparkles, 
  Eye, 
  Edit3, 
  Plus, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  FileText,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListTodo,
  FileCode as CodeIcon,
  Save,
  X,
  Maximize2,
  Minimize2,
  Keyboard
} from 'lucide-react';

export default function ReadmeGenerator() {
  const {
    readmeSections,
    readmeBadges,
    readmeProjectName,
    readmeDescription,
    loadingReadmeAI,
    toggleReadmeSection,
    moveReadmeSection,
    updateReadmeBadges,
    setReadmeMeta,
    setLoadingReadmeAI,
    setReadmeSections,
    addReadmeSection,
    removeReadmeSection,
    addNotification
  } = useDevDockStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [aiCustomContext, setAiCustomContext] = useState('');

  // Editing support states
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenPreview(false);
      }
    };
    if (isFullscreenPreview) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreenPreview]);

  // Reset/Nouveau Markdown README function
  const handleResetReadme = () => {
    setReadmeMeta("Nouveau Projet Dev", "Une superbe application développée en TypeScript, réactive et performante.");
    
    // Disable badges
    readmeBadges.forEach(b => {
      updateReadmeBadges(b.id, b.id === 'version' || b.id === 'build');
    });

    // Reset default simple welcoming sections
    setReadmeSections([
      {
        id: 'intro',
        title: 'Description',
        content: '### Bienvenue sur mon nouveau projet !\n\nCe projet a été initialisé proprement à l’aide du studio DevDock. C’est le point de départ idéal pour concevoir des fonctionnalités incroyables.',
        enabled: true
      },
      {
        id: 'install',
        title: 'Installation',
        content: 'Installez les dépendances nécessaires :\n\n```bash\nnpm install\n# Lancez ensuite le serveur de développement local\nnpm run dev\n```',
        enabled: true
      }
    ]);

    setEditingSectionId(null);
    addNotification('Un nouveau README vierge a été initialisé avec succès !', 'success');
  };

  // Safe style applicator for markdown textarea
  const applyStyle = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end);
    const replacement = prefix + (selectedText || 'texte') + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setEditContent(newContent);
    
    // Put selection focus back
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText || 'texte').length);
    }, 50);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent || navigator.platform || '');
    
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyStyle('**', '**');
    } else if (modifier && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyStyle('*', '*');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingSectionId(null);
      addNotification('Édition annulée.', 'info');
    } else if ((modifier && e.key.toLowerCase() === 's') || (modifier && e.key === 'Enter')) {
      e.preventDefault();
      handleSaveSection();
    }
  };

  const handleStartEditing = (sec: ReadmeSection) => {
    setEditingSectionId(sec.id);
    setEditTitle(sec.title);
    setEditContent(sec.content);
    // Auto-scroll to editor block
    const element = document.getElementById('readme-section-editor-block');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveSection = () => {
    if (!editingSectionId) return;
    
    const updated = readmeSections.map(s => 
      s.id === editingSectionId ? { ...s, title: editTitle, content: editContent } : s
    );
    setReadmeSections(updated);
    setEditingSectionId(null);
    addNotification('Section mise à jour !', 'success');
  };

  // Markdown compiler helper
  const compileMarkdown = () => {
    let result = `# ${readmeProjectName}\n\n`;
    result += `> ${readmeDescription}\n\n`;

    // Render badges
    const enabledBadges = readmeBadges.filter(b => b.enabled);
    if (enabledBadges.length > 0) {
      result += enabledBadges.map(b => 
        `![${b.label}](https://img.shields.io/badge/${encodeURIComponent(b.label)}-${encodeURIComponent(b.value)}-${b.color})`
      ).join(' ') + '\n\n';
    }

    // Render enabled sections
    readmeSections.forEach(sec => {
      if (sec.enabled) {
        result += `## ${sec.title}\n\n${sec.content}\n\n`;
      }
    });

    return result;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(compileMarkdown());
    addNotification('README Markdown copied to clipboard!', 'success');
  };

  const handleDownload = () => {
    const blob = new Blob([compileMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
    addNotification('README.md downloaded successfully!', 'success');
  };

  // Connect to Gemini backend for AI Generation
  const handleAIGenerate = async () => {
    setLoadingReadmeAI(true);
    addNotification('Analyse et composition de votre README en cours...', 'info');
    try {
      const response = await fetch('/api/ai/readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: readmeProjectName,
          description: readmeDescription + ' (Context additional constraints: ' + aiCustomContext + ')',
          sectionsToInclude: readmeSections.map(s => s.id)
        })
      });

      if (!response.ok) {
        throw new Error('Server service responded with error status');
      }

      const data = await response.json();
      if (data.sections && data.sections.length > 0) {
        // Map back
        const updated = readmeSections.map(s => {
          const aiSec = data.sections.find((as: { id: string; title: string; content: string }) => as.id === s.id);
          return aiSec ? { ...s, title: aiSec.title, content: aiSec.content } : s;
        });
        setReadmeSections(updated);
        addNotification('README Premium généré et mis en forme par l’API avec succès !', 'success');
      }
    } catch (err: unknown) {
      console.warn('API key missing or backend failed, triggering premium local markdown compiler fallback...', err);
      
      const lowercaseContext = aiCustomContext.toLowerCase();
      
      // Simulate highly styled and relevant markdown blocks locally
      const updated = readmeSections.map(s => {
        let content = s.content;
        let title = s.title;

        if (s.id === 'intro') {
          title = '📖 Description & Vision';
          content = `### Description du Projet : **${readmeProjectName}**
          
${readmeDescription || 'Une application moderne et interactive.'} et conçue pour répondre aux plus hauts standards de fluidité technique de l'industrie digitale.

#### Caractéristiques Principales
* ⚙️ **Architecture modulaire native** : Séparation stricte des responsabilités.
* ⚡ **Performance optimisée** : Rendu dynamique pour une interactivité instantanée.
* 💎 **Interface ultra-polish** : Confort visuel maximal selon les lignes directrices contemporaines.`;
        } else if (s.id === 'install') {
          title = '⚡ Guide de Démarrage Rapide';
          content = `### Installation locale en quelques clics

Suivez les directives pour initialiser l'environnement de développement :

\`\`\`bash
# 1. Cloner le dépôt officiel du projet
git clone https://github.com/developer/workspace-${readmeProjectName.toLowerCase().replace(/\s+/g, '-')}.git

# 2. Installer l'intégralité des modules requis
npm install

# 3. Lancer le serveur de développement HMR à chaud
npm run dev
\`\`\`

#### Commandes Clés du Workflow
* \`npm run build\` : Compile les static bundles pour la production de masse.
* \`npm run lint\` : Vérifie la rigueur syntaxique globale.`;
        } else if (s.id === 'usage' || s.id === 'config') {
          title = '🔧 Configuration & Architecture';
          content = `### Personnalisation de l'Applet

Ajustez les variables d'environnement dans le fichier principal :

\`\`\`env
# Clé d'API principale pour l'intelligence artificielle
GEMINI_API_KEY=votre_cle_privee

# Port de routage du Reverse Proxy (obligatoirement 3000)
PORT=3000
\`\`\`

#### Variables d'Environnement Recommandées
| Variable | Description | Valeur par défaut |
| :--- | :--- | :--- |
| \`NODE_ENV\` | Mode de compilation en cours | \`development\` |
| \`VITE_CLIENT_URL\` | Adresse du client de confiance | \`http://localhost:3000\` |`;
        } else if (s.id === 'troubleshooting') {
          title = '💡 Dépannage & Support';
          content = `### Résolution des anomalies fréquentes

#### Erreur "Port déjà utilisé (EADDRINUSE)"
Si l'application ne s'ouvre pas sur le port local demandé, exécutez la commande d'analyse suivante pour désactiver le service encombrant :
\`\`\`bash
npx kill-port 3000
\`\`\`

#### Problème de clé de sécurité (API 503)
Assurez-vous que le secret \`GEMINI_API_KEY\` est correctement défini dans le panneau latéral gauche de votre tableau de bord d’intégration. Un redémarrage à blanc est conseillé via le bouton de réinitialisation.`;
        }

        // Apply custom prompt tweaks if user specified them
        if (lowercaseContext.includes('cli') || lowercaseContext.includes('tool')) {
          content += `\n\n*Note pour CLI : Ce module est configuré pour un usage terminal de premier choix.*`;
        } else if (lowercaseContext.includes('docker') || lowercaseContext.includes('container')) {
          content += `\n\n*Précision de containerisation : Compatible pour le déploiement sur grappes Kubernetes et Cloud Run.*`;
        }

        return { ...s, title, content };
      });

      setReadmeSections(updated);
      addNotification(`[Simulation Locale Active] README mis en forme pour "${readmeProjectName}" !`, 'info');

    } finally {
      setLoadingReadmeAI(false);
    }
  };

  const handleAddNewSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle || !newSectionContent) return;

    const id = 'custom-' + Date.now();
    const newSec = {
      id,
      title: '🎯 ' + newSectionTitle,
      content: newSectionContent,
      enabled: true
    };

    addReadmeSection(newSec);

    setNewSectionTitle('');
    setNewSectionContent('');
    setIsAdding(false);
    addNotification('Custom README section appended!', 'success');
  };

  const deleteSection = (id: string) => {
    removeReadmeSection(id);
    addNotification('Section removed.', 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      
      {/* LEFT COLUMN: Controls & Editor */}
      <div className="flex flex-col gap-6 max-h-[82vh] overflow-y-auto pr-2">
        
        {/* Core Project Info */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit3 size={18} className="text-blue-400" />
              Meta details de l’application
            </h2>
            <button
              onClick={handleResetReadme}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-gray-900 font-medium text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
              title="Réinitialiser et démarrer un nouveau README"
            >
              <Plus size={13} />
              Nouveau README
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5">Nom du Projet</label>
              <input 
                type="text"
                value={readmeProjectName}
                onChange={(e) => setReadmeMeta(e.target.value, readmeDescription)}
                className="w-full px-4 py-2.5 bg-white/60 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all text-gray-900 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1.5 font-sans">Brève Description</label>
              <textarea 
                value={readmeDescription}
                onChange={(e) => setReadmeMeta(readmeProjectName, e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/60 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all text-gray-900 font-sans text-gray-700 resize-none"
              />
            </div>
          </div>
        </div>

        {/* AI Generator prompt panel */}
        <div className="p-6 rounded-2xl border border-blue-500/10 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-950/50 glow-indigo relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-400 animate-pulse" />
                Génération de README par IA
              </h3>
              <p className="text-xs text-gray-500 mt-1">Laissez Gemini 3.5-Flash rédiger des guides professionnels adaptés à vos besoins.</p>
            </div>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Ex: Mettre l'accent sur les tests unitaire, architecture Hexagonale, TypeScript..." 
              value={aiCustomContext}
              onChange={(e) => setAiCustomContext(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-500"
            />
            {/* Quick Context Prompt Suggestions */}
            <div>
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1.5 font-bold">Presets de contexte</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Outil CLI', prompt: 'Command-line tool utility style with clean flags parameters table' },
                  { label: 'React Library', prompt: 'Shared component React library package with modern hooks documentation' },
                  { label: 'SaaS Docker stack', prompt: 'SaaS web cloud ecosystem with complete docker-compose orchestrator containers and security environments' }
                ].map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiCustomContext(pill.prompt);
                      addNotification(`Contexte configuré : "${pill.label}"`, 'info');
                    }}
                    className="px-2 py-1 text-[9px] bg-gray-100 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg border border-gray-200 transition-all cursor-pointer"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleAIGenerate}
              disabled={loadingReadmeAI}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-gray-900 font-medium text-xs shadow-md shadow-blue-500/15 cursor-pointer transition-all"
            >
              {loadingReadmeAI ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Régénération en cours...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-yellow-200" />
                  Rédiger avec Gemini AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Badges Toggles */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Badges Repository</h3>
          <div className="flex flex-wrap gap-2.5">
            {readmeBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => updateReadmeBadges(badge.id, !badge.enabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  badge.enabled
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{badge.label}</span>
                <span className="opacity-60">[{badge.value}]</span>
                {badge.enabled && <Check size={12} />}
              </button>
            ))}
          </div>
        </div>

        {/* Draggable/Reorderable Sections Manager */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-slate-900/40 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Sections de la documentation</h3>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={14} /> Ajouter une section
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddNewSection} className="p-4 rounded-xl border border-gray-200 bg-white/60 mb-4 space-y-3">
              <input
                type="text"
                placeholder="Ex: Configuration CI/CD, Contribution, Changelog..."
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900"
              />
              <textarea
                placeholder="Rédigez le contenu markdown ici..."
                value={newSectionContent}
                onChange={(e) => setNewSectionContent(e.target.value)}
                required
                rows={4}
                className="w-full text-xs px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-mono resize-none"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-gray-900 rounded-lg hover:bg-blue-500"
                >
                  Créer
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {readmeSections.map((sec, index) => (
              <motion.div
                key={sec.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                whileHover={{ scale: 1.01, borderColor: 'rgba(255, 255, 255, 0.15)' }}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  sec.enabled 
                    ? 'bg-slate-950/60 border-gray-200' 
                    : 'bg-white/30 border-gray-200 opacity-50'
                } ${editingSectionId === sec.id ? 'ring-1 ring-blue-500' : ''}`}
              >
                <div className="flex items-center gap-3 w-4/6">
                  {/* Toggle button */}
                  <input
                    type="checkbox"
                    checked={sec.enabled}
                    onChange={() => toggleReadmeSection(sec.id)}
                    className="accent-blue-500 cursor-pointer h-4 w-4 rounded border-gray-300"
                  />
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-900 font-sans">{sec.title}</p>
                    <p className="text-xs text-gray-500 font-mono truncate">{sec.content.substring(0, 70)}...</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    onClick={() => handleStartEditing(sec)}
                    className={`p-1.5 rounded transition-colors ${
                      editingSectionId === sec.id 
                        ? 'bg-blue-600 text-gray-900' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
                    }`}
                    title="Éditer le contenu avec l'éditeur de styles"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    disabled={index === 0}
                    onClick={() => moveReadmeSection(sec.id, 'up')}
                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    disabled={index === readmeSections.length - 1}
                    onClick={() => moveReadmeSection(sec.id, 'down')}
                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <ChevronDown size={14} />
                  </button>
                  {sec.id.startsWith('custom-') && (
                    <button
                      onClick={() => deleteSection(sec.id)}
                      className="p-1 rounded bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 5. RICH MARKDOWN SECTION EDITOR BLOCK */}
        {editingSectionId && (
          <div id="readme-section-editor-block" className="p-6 rounded-2xl border border-blue-500/20 bg-white backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Edit3 size={15} className="text-blue-400" />
                  Éditeur de Section
                </h3>
                <p className="text-[11px] text-gray-500 font-sans">
                  Mettez en forme votre texte grâce à la barre d'outils ou via les raccourcis clavier <span className="text-indigo-600 font-mono font-bold">Ctrl/⌘+B</span>, <span className="text-indigo-600 font-mono font-bold">Ctrl/⌘+I</span>, <span className="text-emerald-600 font-mono font-bold">Ctrl/⌘+Enter</span> (Enregistrer) ou <span className="text-red-400 font-mono font-bold">Échap</span>
                </p>
              </div>
              <button 
                onClick={() => setEditingSectionId(null)}
                className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1">Titre de la Section</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1">Style & Formatage</label>
                
                {/* Style toolbar buttons (Bold, Italic, titles, lists, code) */}
                <div className="flex flex-wrap gap-1 p-1 bg-white/60 border border-gray-200 rounded-t-xl">
                  <button
                    type="button"
                    onClick={() => applyStyle('**', '**')}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-bold font-mono min-w-[28px]"
                    title="Gras (**texte**) — Ctrl+B (Win) / ⌘+B (Mac)"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStyle('*', '*')}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs italic font-mono min-w-[28px]"
                    title="Italique (*texte*) — Ctrl+I (Win) / ⌘+I (Mac)"
                  >
                    <Italic size={13} />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button
                    type="button"
                    onClick={() => applyStyle('# ', '')}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold"
                    title="Titre de niveau 1 (#)"
                  >
                    <Heading1 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStyle('## ', '')}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold"
                    title="Titre de niveau 2 (##)"
                  >
                    <Heading2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStyle('### ', '')}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-semibold"
                    title="Titre de niveau 3 (###)"
                  >
                    <Heading3 size={13} />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button
                    type="button"
                    onClick={() => applyStyle('- ', '')}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs"
                    title="Liste à puces (-)"
                  >
                    <List size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStyle('- [ ] ', '')}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs"
                    title="Liste de tâches (- [ ])"
                  >
                    <ListTodo size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStyle('```bash\n', '\n```')}
                    className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs font-mono"
                    title="Bloc de code (```)"
                  >
                    <CodeIcon size={13} />
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  rows={8}
                  className="w-full text-xs p-3.5 bg-white/80 border-x border-b border-gray-200 rounded-b-xl text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                  placeholder="Écrivez ou sélectionnez du texte pour appliquer un style..."
                />

                {/* Keyboard Shortcuts Helper Panel */}
                <div className="mt-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Keyboard size={12} className="text-gray-450" />
                    Raccourcis clavier (Shortcuts Windows / Mac)
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono select-none">
                    <div className="flex items-center justify-between py-0.5 border-b border-gray-200">
                      <span className="text-gray-500">Gras</span>
                      <span className="text-indigo-600 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">
                        Ctrl+B <span className="opacity-40 text-gray-500 text-[9px]">/ ⌘B</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 border-b border-gray-200">
                      <span className="text-gray-500">Italique</span>
                      <span className="text-indigo-600 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/10">
                        Ctrl+I <span className="opacity-40 text-gray-500 text-[9px]">/ ⌘I</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 border-b border-gray-200">
                      <span className="text-gray-500">Enregistrer</span>
                      <span className="text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 animate-pulse">
                        Ctrl+Enter <span className="opacity-40 text-gray-500 text-[9px]">/ ⌘↵ / ⌘S</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 border-b border-gray-200">
                      <span className="text-gray-500">Annuler / Quitter</span>
                      <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/10">
                        Échap <span className="opacity-40 text-gray-500 text-[9px]">/ Esc</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingSectionId(null)}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                >
                  <X size={12} className="inline mr-1" /> Terminer
                </button>
                <button
                  type="button"
                  onClick={handleSaveSection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-gray-900 rounded-xl shadow font-semibold"
                >
                  <Save size={12} className="inline mr-1" /> Enregistrer les changements
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Output & Preview Panel */}
      <div className="flex flex-col gap-4 max-h-[82vh] border border-gray-200 rounded-2xl bg-slate-950/70 overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900/60 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'editor'
                  ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileText size={13} />
              Markdown
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'preview'
                  ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Eye size={13} />
              Previsualiser
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreenPreview(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/15 hover:bg-indigo-600/30 text-xs font-semibold rounded-xl text-indigo-600 hover:text-gray-900 border border-indigo-500/20 transition-all cursor-pointer"
              title="Prévisualiser en plein écran"
            >
              <Maximize2 size={13} />
              Plein écran
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-100 text-xs font-semibold rounded-xl text-gray-700 hover:text-gray-900 border border-gray-200 transition-all cursor-pointer"
            >
              <Copy size={13} />
              Copier
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-gray-900 shadow-md shadow-blue-500/10 cursor-pointer transition-all"
            >
              <Download size={13} />
              Exporter .md
            </button>
          </div>
        </div>

        {/* Main Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          
          {activeTab === 'editor' ? (
            <div className="h-full">
              <div className="text-xs text-gray-500 font-mono mb-2 flex items-center justify-between">
                <span>FILEPATH: README.md</span>
                <span>Type: Raw Text</span>
              </div>
              <textarea
                value={compileMarkdown()}
                readOnly
                className="w-full h-full bg-transparent text-gray-700 font-mono text-sm leading-relaxed border-none focus:outline-none resize-none cursor-text select-text"
              />
            </div>
          ) : (
            <div className="markdown-body text-left max-w-none p-2">
              <MarkdownRenderer content={compileMarkdown()} />
            </div>
          )}

        </div>

      </div>

      {/* FULL SCREEN PREVIEW OVERLAY */}
      <AnimatePresence>
        {isFullscreenPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col p-6 overflow-hidden md:p-8"
          >
            {/* Top Control Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {readmeProjectName || 'Projet sans titre'}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 font-normal border border-indigo-500/20">
                      Plein écran
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500">Générateur interactif de fichiers README</p>
                </div>
              </div>

              {/* Toolbar in Fullscreen */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mode Selector inside Fullscreen */}
                <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200 mr-2">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      activeTab === 'editor'
                        ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <CodeIcon size={13} />
                    Code brut
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      activeTab === 'preview'
                        ? 'bg-gray-100 text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Eye size={13} />
                    Rendu
                  </button>
                </div>

                {/* Performance Actions */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-100 text-xs font-semibold rounded-xl text-gray-700 hover:text-gray-900 border border-gray-200 transition-all cursor-pointer"
                >
                  <Copy size={13} />
                  Copier
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-gray-900 shadow-md shadow-blue-500/10 cursor-pointer transition-all"
                >
                  <Download size={13} />
                  Exporter .md
                </button>

                <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

                <button
                  onClick={() => setIsFullscreenPreview(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 hover:text-gray-900 text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                  title="Appuyez sur Échap pour quitter"
                >
                  <Minimize2 size={13} />
                  Quitter (Échap)
                </button>
              </div>
            </div>

            {/* Content Preview Container */}
            <div className="flex-1 max-w-5xl w-full mx-auto bg-slate-950/60 border border-gray-200 rounded-2xl p-6 md:p-8 overflow-y-auto mt-2 shadow-2xl relative scroll-smooth">
              {activeTab === 'editor' ? (
                <div className="h-full flex flex-col">
                  <div className="text-xs text-indigo-600 font-mono mb-3 flex items-center justify-between select-none">
                    <span>PATH: README.md</span>
                    <span className="bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">TEXTE BRUT MARKDOWN</span>
                  </div>
                  <textarea
                    value={compileMarkdown()}
                    readOnly
                    className="flex-1 w-full bg-transparent text-gray-700 font-mono text-sm leading-relaxed border-none focus:outline-none resize-none cursor-text select-text focus:ring-0 p-2"
                  />
                </div>
              ) : (
                <div className="markdown-body text-left max-w-none p-2">
                  <MarkdownRenderer content={compileMarkdown()} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
