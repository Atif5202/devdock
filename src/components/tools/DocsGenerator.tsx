/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDevDockStore } from '../../store/devdockStore';
import { DocPage } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { 
  Sparkles, 
  Copy, 
  BookOpen, 
  Search, 
  Printer, 
  BookOpenText,
  FileCode,
  ChevronRight,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Save
} from 'lucide-react';

export default function DocsGenerator() {
  const {
    documentationPages,
    selectedDocPage,
    docTheme,
    loadingDocAI,
    addDocPage,
    setSelectedDocPage,
    setDocTheme,
    setLoadingDocAI,
    updateSelectedDocPage,
    deleteDocPage,
    activeArchitecture,
    addNotification
  } = useDevDockStore();

  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [selectedFilesToDoc, setSelectedFilesToDoc] = useState<Record<string, boolean>>({
    'server.ts': true,
    'auth.ts': true
  });

  const [aiDocPrompt, setAiDocPrompt] = useState('Create complete REST API parameters tables with authentication descriptions.');

  // Editing documentation support
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [docEditTitle, setDocEditTitle] = useState('');
  const [docEditContent, setDocEditContent] = useState('');

  const handleCreateNewDocPage = () => {
    const id = 'custom-doc-' + Date.now();
    const newPage: DocPage = {
      id,
      title: 'Guide sans titre',
      category: 'Manuel client',
      content: '### Nouvelle page de documentation\n\nRédigez votre guide technique ici en utilisant du formatage Markdown classique.'
    };
    addDocPage(newPage);
    setDocEditTitle(newPage.title);
    setDocEditContent(newPage.content);
    setIsEditingDoc(true);
    addNotification('Nouvelle page de guide créée !', 'success');
  };

  const handleDeleteDocPage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDocPage(id);
    setIsEditingDoc(false);
    addNotification('Guide technique supprimé.', 'info');
  };

  const handleStartEditingDoc = () => {
    if (!selectedDocPage) return;
    setDocEditTitle(selectedDocPage.title);
    setDocEditContent(selectedDocPage.content);
    setIsEditingDoc(true);
  };

  const handleSaveDocPage = () => {
    if (!selectedDocPage) return;
    updateSelectedDocPage(docEditTitle, docEditContent);
    setIsEditingDoc(false);
    addNotification('Guide enregistré avec succès !', 'success');
  };

  const handleToggleDocFile = (fileName: string) => {
    setSelectedFilesToDoc(prev => ({ ...prev, [fileName]: !prev[fileName] }));
  };

  const handleCopyMarkdown = () => {
    if (!selectedDocPage) return;
    navigator.clipboard.writeText(selectedDocPage.content);
    addNotification('Documentations (Markdown) copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    const content = selectedDocPage?.content;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${selectedDocPage?.title || 'Documentation'}</title><style>body{font-family:system-ui,sans-serif;padding:2rem;line-height:1.6;max-width:800px;margin:0 auto}pre{background:#f5f5f5;padding:1rem;border-radius:6px;overflow-x:auto}code{background:#f0f0f0;padding:0.125rem 0.25rem;border-radius:3px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:0.5rem}</style></head><body>${content.replace(/\n/g, '<br>')}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    addNotification('Preview print lancé...', 'info');
  };

  // Connect to server-side Gemini Document Page Compilation endpoint
  const handleCompileAIDocs = async () => {
    const activeFileNames = Object.keys(selectedFilesToDoc).filter(k => selectedFilesToDoc[k]);
    if (activeFileNames.length === 0) {
      addNotification('Veuillez sélectionner au moins un fichier à documenter', 'warning');
      return;
    }

    setLoadingDocAI(true);
    addNotification('Analyse des fichiers et synthèse avec l’IA...', 'info');

    try {
      const resp = await fetch('/api/ai/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileNames: activeFileNames,
          targetTheme: docTheme + ' (Context prompt constraints: ' + aiDocPrompt + ')'
        })
      });

      if (!resp.ok) {
        throw new Error('API key missing or backend error');
      }

      const data = await resp.json();
      if (data.title && data.content) {
        const newPage: DocPage = {
          id: 'doc-ai-' + Date.now(),
          title: data.title,
          category: data.category || 'AI Auto-Generated',
          content: data.content
        };
        addDocPage(newPage);
        addNotification(`Nouveau guide généré : "${newPage.title}"!`, 'success');
      }
    } catch (err: unknown) {
      console.warn('Backend analyzer failed, triggering premium doc compiler fallback...', err);
      
      const lowercasePrompt = aiDocPrompt.toLowerCase();
      let simTitle: string;
      let simCategory: string;
      let simContent: string;

      if (lowercasePrompt.includes('oauth') || lowercasePrompt.includes('auth') || lowercasePrompt.includes('login')) {
        simTitle = 'Guide d’Intégration OAuth & JWT';
        simCategory = 'Authentification';
        simContent = `### Guide d’Intégration OAuth & JWT

Ce document spécifie les endpoints et protocoles d’authentification pour sécuriser vos applications SaaS.

#### Architecture Globale de Session
\`\`\`
[ Client SPA ] --( Auth Prompt )--&gt; [ GitHub OAuth Gate ]
      |                                       |
  (JWT Token) &lt;--[ DevDock Core Session ] &lt;----/
\`\`\`

#### Endpoints d'Authentification

| URL d'accès | Protocole | Type de charge | Description |
| :--- | :--- | :--- | :--- |
| \`/api/auth/login\` | POST | JSON (\`email\`) | Initie une session de simulation et signe un jeton JWT d'accès temporaire. |
| \`/api/auth/github/callback\` | GET | Query params | URL de redirection de l'OAuth GitHub de confiance. |

#### Exemple d'Entête HTTP
Utilisez l'entête standard Bearer pour toutes les requêtes subséquentes :
\`\`\`http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.devdock-YXV0aC1kZXZlbG9wZXJAZ2l0aHViLmNvbQ==
\`\`\``;
      } else if (lowercasePrompt.includes('graphql') || lowercasePrompt.includes('gateway') || lowercasePrompt.includes('schema')) {
        simTitle = 'Spécifications GraphQL Gateway Schema';
        simCategory = 'Schema API';
        simContent = `### GraphQL Federated Gateway Schema

Ce schéma unifie les données utilisateur, les projets de design et les modèles de palettes chromatiques.

#### Requêtes Principales (Queries)
\`\`\`graphql
type Query {
  me: User!
  activeArchitectures: [ProjectArchitecture!]!
  componentLibrary(variant: String): [GeneratedComponent!]!
}

type User {
  id: ID!
  email: String!
  role: String!
  avatarUrl: String
}
\`\`\`

#### Exemple d'Exécution sur le Cluster
\`\`\`bash
# Interrogation via le client curl
curl -X POST http://localhost:3000/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ me { email role } }"}'
\`\`\``;
      } else if (lowercasePrompt.includes('micro') || lowercasePrompt.includes('cluster') || lowercasePrompt.includes('specs')) {
        simTitle = 'Spécifications d’Infrastructure Microservices';
        simCategory = 'Architecture Cloud';
        simContent = `### Documentation Métrique & Clusters de Calcul

Aperçu complet de l'orchestration des tâches synchrones et asynchrones.

#### Cartographie des Nœuds
* **Node de Routage Ingress** : Proxy NGINX liant le port externe au port interne \`3000\`.
* **Daemon Node de Render** : Sandbox isolée de compilation des composants React.
* **Cache Distribué** : Stockage éphémère de persistance pour l'historique des requêtes et les jetons.

#### Paramètres d'Échelonnage (Scaler)
\`\`\`yaml
resources:
  limits:
    cpu: 1000m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 128Mi
\`\`\``;
      } else {
        // Dynamic generic fallback documentation
        simTitle = `Documentation : ${activeFileNames.join(', ')}`;
        simCategory = 'Synthèse Automatique';
        simContent = `### Spécifications pour ${activeFileNames.join(' & ')}

Analyse automatique des caractéristiques structurelles et de la complexité algorithmique.

#### Vue d'ensemble des modules
Ces fichiers structurés fournissent les briques de base de votre suite. Un plan de requêtage direct ou d'import de module est recommandé pour l'assemblage.

#### Diagnostic de Complexité
* **Complexité Global** : Modérée.
* **Accessibilité** : Conforme aux normes d'isolation modulaire.
* **Dépendances tierces** : \`lucide-react\`, \`motion/react\` et gestionnaire de store global.

*Guide technique compilé en local à la demande par le simulateur de secours.*`;
      }

      const simPage: DocPage = {
        id: 'doc-sim-' + Date.now(),
        title: simTitle,
        category: simCategory,
        content: simContent
      };

      addDocPage(simPage);
      addNotification(`[Simulation Active] Guide généré : "${simTitle}"`, 'info');

    } finally {
      setLoadingDocAI(false);
    }
  };

  // Search filtered pages list
  const filteredDocPages = documentationPages.filter(p => 
    p.title.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
      
      {/* LEFT COLUMN: Sidebar Navigation & Code compiler controller (4 cols) */}
      <div className="xl:col-span-4 flex flex-col gap-6 max-h-[82vh] overflow-y-auto pr-2 text-left">
        
        {/* Search & Pages index navigation */}
        <div className="p-6 rounded-2xl border border-gray-200 bg-white backdrop-blur-md">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search documentation pages..."
              value={searchDocQuery}
              onChange={(e) => setSearchDocQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium select-none">Index des guides</p>
                <button
                  onClick={handleCreateNewDocPage}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-600 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                  title="Créer un nouveau guide à blanc"
                >
                  <Plus size={11} /> Nouveau
                </button>
              </div>
              <div className="space-y-1">
                {filteredDocPages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => {
                      setSelectedDocPage(page);
                      setIsEditingDoc(false);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-colors cursor-pointer ${
                      selectedDocPage?.id === page.id
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-500/10'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen size={12} className="text-gray-500" />
                      <span className="truncate">{page.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {page.id.startsWith('custom-doc-') && (
                        <button
                          onClick={(e) => handleDeleteDocPage(page.id, e)}
                          className="p-1 rounded bg-red-950/20 hover:bg-red-900/40 text-red-600 hover:text-red-300 transition-colors"
                          title="Supprimer cette notice"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                      <ChevronRight size={11} className="opacity-40" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Documentation Creator from blueprint files */}
        <div className="p-6 rounded-2xl border border-indigo-500/10 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-950/40 glow-indigo relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-yellow-600 animate-pulse" />
            Compilateur de Documentation
          </h3>
          <p className="text-[11px] text-gray-500 mb-4 font-sans leading-normal">Cochez les fichiers de votre projet ci-dessous pour rédiger une documentation technique unifiée.</p>

          <div className="space-y-3 mb-4">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-medium">Files list</p>
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 scrollbar-none max-h-[140px] overflow-y-auto">
              {activeArchitecture.nodes.map(node => (
                <label 
                  key={node.id} 
                  className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer text-xs font-mono select-none transition-colors ${
                    selectedFilesToDoc[node.id]
                      ? 'bg-indigo-50 text-indigo-200 border border-indigo-500/10'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedFilesToDoc[node.id]}
                    onChange={() => handleToggleDocFile(node.id)}
                    className="accent-indigo-500 cursor-pointer"
                  />
                  <FileCode size={13} className={selectedFilesToDoc[node.id] ? "text-indigo-600" : "text-gray-500"} />
                  <span>{node.id}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Theme style</p>
              <select
                value={docTheme}
                onChange={(e) => setDocTheme(e.target.value as 'modern' | 'minimalist' | 'cyberpunk')}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-900"
              >
                <option value="modern">Modern Tech (Stripe)</option>
                <option value="minimalist">Minimalist Dark (Notion)</option>
                <option value="cyberpunk">Cyberpunk District</option>
              </select>
            </div>

            <div>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Instructions de l'IA</p>
              <textarea
                value={aiDocPrompt}
                onChange={(e) => setAiDocPrompt(e.target.value)}
                placeholder="Ex: Rédiger des tables de paramètres d'API de manière exhaustive..."
                rows={2}
                className="w-full text-xs px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
              />
              {/* Presets for documentation prompt compilation */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  { label: 'Authentification OAuth', prompt: 'Create complete REST API parameters tables with OAuth and JWT authentication descriptions.' },
                  { label: 'GraphQL Schema', prompt: 'GraphQL Federated Gateway queries and schemas metadata blocks.' },
                  { label: 'Compute Clusters', prompt: 'Kubernetes configuration YAML specs, cloud node orchestrators metrics.' }
                ].map((pill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiDocPrompt(pill.prompt);
                      addNotification(`Prompt configuré : "${pill.label}"`, 'info');
                    }}
                    className="px-2 py-0.5 text-[8px] bg-gray-100 hover:bg-gray-200 hover:text-gray-900 text-gray-500 rounded transition-all cursor-pointer"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCompileAIDocs}
              disabled={loadingDocAI}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-gray-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {loadingDocAI ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-900" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <BookOpenText size={13} className="text-indigo-200" />
                  Générer avec Gemini AI
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Live Documentation Markdown Viewer (8 cols) */}
      <div className="xl:col-span-8 flex flex-col gap-4 max-h-[82vh] border border-gray-200 rounded-2xl bg-slate-950/70 overflow-hidden text-left">
        
        {/* Document Header Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-900/60 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {selectedDocPage ? selectedDocPage.category : 'READ'}
            </span>
            {isEditingDoc && (
              <span className="text-[10px] font-mono font-bold uppercase py-1 px-2.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Mode Édition Actif
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedDocPage && !isEditingDoc && (
              <button
                onClick={handleStartEditingDoc}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-gray-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Edit3 size={12} />
                Éditer le Guide
              </button>
            )}
            <button
              onClick={handleCopyMarkdown}
              disabled={!selectedDocPage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-100 text-xs font-semibold rounded-xl text-gray-700 hover:text-gray-900 border border-gray-200 transition-colors cursor-pointer animate-fade-in"
            >
              <Copy size={13} />
              Markdown
            </button>
            <button
              onClick={handlePrint}
              disabled={!selectedDocPage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-100 text-xs font-semibold rounded-xl text-gray-700 hover:text-gray-900 border border-gray-200 transition-colors cursor-pointer"
            >
              <Printer size={13} />
              Print Guide
            </button>
          </div>
        </div>

        {/* Documentation Content Page and Markdown text parser */}
        <div className="flex-1 overflow-y-auto p-8 font-sans scroll-smooth">
          {selectedDocPage ? (
            isEditingDoc ? (
              <div className="space-y-4 max-w-2xl">
                <div className="pb-3 border-b border-gray-200">
                  <h3 className="text-md font-bold text-gray-900 mb-1">Modifier le guide technique</h3>
                  <p className="text-xs text-gray-500">Rédigez l'explication finale de votre API ou guide d'installation.</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1">Titre du Guide</label>
                    <input 
                      type="text" 
                      value={docEditTitle}
                      onChange={(e) => setDocEditTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1">Contenu (Markdown)</label>
                    <textarea
                      value={docEditContent}
                      onChange={(e) => setDocEditContent(e.target.value)}
                      rows={12}
                      className="w-full text-xs p-3.5 bg-white border border-gray-200 rounded-xl text-gray-200 font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="Complétez avec le contenu de votre documentation..."
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingDoc(false)}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDocPage}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-gray-900 font-semibold rounded-xl shadow-md"
                    >
                      <Save size={12} className="inline mr-1" /> Enregistrer les changements
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="markdown-body p-2 max-w-none">
                <MarkdownRenderer content={selectedDocPage.content} />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <BookOpenText size={48} className="text-gray-700 mb-3 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900">Sélectionnez ou compilez un guide</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">Démarrer par la sélection de fichiers de code puis lancez l'IA pour générer une notice technique complète.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
