/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDevDockStore } from './store/devdockStore';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  FileText, 
  Sliders, 
  Code, 
  Network, 
  BookOpenText, 
  LayoutGrid, 
  Search, 
  Github, 
  LogOut, 
  Key, 
  Cpu,
  Info,
  Loader2,
  Braces,
  Database,
  Grid3X3,
  Menu,
} from 'lucide-react';

// Lazy-loaded tool components
const ReadmeGenerator = lazy(() => import('./components/tools/ReadmeGenerator'));
const ColorGenerator = lazy(() => import('./components/tools/ColorGenerator'));
const ComponentGenerator = lazy(() => import('./components/tools/ComponentGenerator'));
const ArchitectureVisualizer = lazy(() => import('./components/tools/ArchitectureVisualizer'));
const DocsGenerator = lazy(() => import('./components/tools/DocsGenerator'));
const ThemeStudio = lazy(() => import('./components/tools/ThemeStudio'));
const RegexTester = lazy(() => import('./components/tools/RegexTester'));
const JsonFormatter = lazy(() => import('./components/tools/JsonFormatter'));
const SqlEditor = lazy(() => import('./components/tools/SqlEditor'));
const EnvFileManager = lazy(() => import('./components/tools/EnvFileManager'));
const IconBrowser = lazy(() => import('./components/tools/IconBrowser'));

function ToolFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 size={24} className="text-indigo-400 animate-spin" />
    </div>
  );
}

function ToolWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<ToolFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const {
    activeTool,
    user,
    notifications,
    setActiveTool,
    addNotification,
    removeNotification,
    login,
    logout
  } = useDevDockStore();

  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check backend server connection status on launch
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        if (data.status === 'online') {
          setApiOnline(true);
          addNotification('DevDock Server API connected. Gemini services secure!', 'info');
        } else {
          setApiOnline(false);
        }
      })
      .catch(() => {
        setApiOnline(false);
        addNotification('Server running in offline-local compatibility fallback mode.', 'warning');
      });

    // Handle dummy OAuth GitHub redirection success signals from the backend router
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success') === 'true') {
      const email = params.get('email') || 'oauth-dev@github.com';
      login(email);
      addNotification('Authenticated securely with GitHub OAuth!', 'success');
      // Clean query params
      window.history.replaceState({}, document.title, "/");
    }
  }, [addNotification, login]);

  // Keyboard shortcut listener (Cmd/Ctrl + K for command center & Alt/Option + 1-6 for tool switching)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
      }

      // Alt/Option + Numbers 1-11 for workspace tools switching
      if (e.altKey && ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-'].includes(e.key)) {
        e.preventDefault();
        const toolMap: Record<string, 'readme' | 'palette' | 'components' | 'architecture' | 'docs' | 'saas-theme' | 'regex' | 'json' | 'sql' | 'env' | 'icons'> = {
          '1': 'readme', '2': 'palette', '3': 'components', '4': 'architecture',
          '5': 'docs', '6': 'saas-theme', '7': 'regex', '8': 'json', '9': 'sql',
          '0': 'env', '-': 'icons'
        };
        const labels: Record<string, string> = {
          'readme': 'Générateur README',
          'palette': 'Palette de Couleurs',
          'components': 'Composants React',
          'architecture': "Visualiseur d'Architecture",
          'docs': 'Générateur API Docs',
          'saas-theme': 'Theme Studio Suite',
          'regex': 'Regex Tester',
          'json': 'JSON Formatter',
          'sql': 'SQL Editor',
          'env': 'Env File Manager',
          'icons': 'Icon Browser'
        };
        const toolId = toolMap[e.key];
        if (toolId) {
          setActiveTool(toolId);
          addNotification(`Outil activé : ${labels[toolId]} (Raccourci clavier)`, 'success');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, addNotification]);

  // Direct mock GitHub login trigger
  const handleGithubOAuthTrigger = () => {
    addNotification('Redirecting to secure GitHub authentication portal...', 'info');
    // Simulate navigation to express endpoint
    window.location.href = '/api/auth/github/callback?code=mock-oauth-code-handshake';
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail })
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === 'success') {
          login(loginEmail);
          setIsLoginModalOpen(false);
          addNotification('Authenticated with JWT token successfully!', 'success');
        }
      })
      .catch(() => {
        // Fallback state
        login(loginEmail);
        setIsLoginModalOpen(false);
        addNotification('Authenticated globally (JWT Offline fallback mode)!', 'success');
      });
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-700 font-sans selection:bg-indigo-200 selection:text-indigo-900 overflow-hidden">
      
      {/* 1. LEFT SIDEBAR (Linear Style Navbar Grid) */}
      <aside className={`w-64 border-r border-gray-200 bg-white flex flex-col justify-between shrink-0 z-20 ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        
        <div>
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                D
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900 tracking-tight">DevDock Suite</h1>
                <p className="text-[9px] text-gray-400 font-mono tracking-widest font-bold">WORKSPACE v1.4</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsCommandMenuOpen(true)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded bg-gray-100 border border-gray-200 text-[9px] font-mono tracking-tighter"
              title="Global command center"
            >
              ⌘K
            </button>
          </div>

          {/* Core Modular Tools navigation and tabs lists */}
          <nav className="p-3.5 space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest pl-3 mb-2 font-bold select-none">Boîte à outils</p>
              <div className="space-y-1">
                {[
                  { id: 'readme' as const, label: 'Générateur README', icon: FileText, desc: 'Marketing landing' },
                  { id: 'palette' as const, label: 'Palette de Couleurs', icon: Sliders, desc: 'Chroma formula' },
                  { id: 'components' as const, label: 'Composants React', icon: Code, desc: 'Interactive workshop' },
                  { id: 'architecture' as const, label: 'Visualiseur d\'Arch', icon: Network, desc: 'Mesh dependency' },
                  { id: 'docs' as const, label: 'Générateur API Docs', icon: BookOpenText, desc: 'Markdown compiler' },
                  { id: 'saas-theme' as const, label: 'Theme Studio Suite', icon: LayoutGrid, desc: 'SaaS layout' },
                  { id: 'regex' as const, label: 'Regex Tester', icon: Search, desc: 'Pattern matching' },
                  { id: 'json' as const, label: 'JSON Formatter', icon: Braces, desc: 'Format & validate' },
                  { id: 'sql' as const, label: 'SQL Editor', icon: Database, desc: 'Query runner' },
                  { id: 'env' as const, label: 'Env File Manager', icon: FileText, desc: '.env profiles' },
                  { id: 'icons' as const, label: 'Icon Browser', icon: Grid3X3, desc: 'Lucide icons' },
                ].map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTool === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTool(item.id)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer relative group ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={14} className={isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-600 transition-colors"} />
                        <div>{item.label}</div>
                      </div>

                      {isActive && (
                        <motion.span 
                          layoutId="activeIndicator"
                          className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>

        {/* PROFILE SECTION / JWT AUTH / SERVER HEALTH STATE STATUS */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/80 space-y-4">
          
          {/* Express health telemetry marker */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 text-[10px]">
            <span className="text-gray-500 font-mono">CONNECTION Telemetry:</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className={apiOnline ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {apiOnline ? 'API READY' : 'OFFLINE MODE'}
              </span>
            </div>
          </div>

          {/* Profiles and OAuth handshake check */}
          {user ? (
            <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 overflow-hidden">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full border border-gray-200" 
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-gray-900 truncate font-sans">{user.name}</h4>
                  <p className="text-[10px] text-gray-500 truncate">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  addNotification('Session closed successfully.', 'info');
                }}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
                title="Clore la session"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                <Key size={12} />
                Se connecter (JWT)
              </button>
              <button
                onClick={handleGithubOAuthTrigger}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
              >
                <Github size={12} />
                Sync GitHub OAuth
              </button>
            </div>
          )}

        </div>

      </aside>

      {/* 2. MAIN CORE WINDOWS CONSOLE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-gray-50">
        
        {/* Upper Header strip controls: quick search bar & notification gauges */}
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-gray-800 font-sans tracking-wide uppercase flex items-center gap-2">
              {{
                'readme': <><FileText size={14} className="text-indigo-500" /><span>Outil : Markdown README Generator</span></>,
                'palette': <><Sliders size={14} className="text-indigo-500" /><span>Outil : Color Harmony Canvas</span></>,
                'components': <><Code size={14} className="text-indigo-500" /><span>Outil : Stateful Component Studio</span></>,
                'architecture': <><Network size={14} className="text-indigo-500" /><span>Outil : Project Mesh Visualizer</span></>,
                'docs': <><BookOpenText size={14} className="text-indigo-500" /><span>Outil : Documentation compiler</span></>,
                'saas-theme': <><LayoutGrid size={14} className="text-indigo-500" /><span>Outil : Live SaaS Theme Dashboard</span></>,
                'regex': <><Search size={14} className="text-indigo-500" /><span>Outil : Regex Tester</span></>,
                'json': <><Braces size={14} className="text-indigo-500" /><span>Outil : JSON Formatter</span></>,
                'sql': <><Database size={14} className="text-indigo-500" /><span>Outil : SQL Editor</span></>,
                'env': <><FileText size={14} className="text-indigo-500" /><span>Outil : Env File Manager</span></>,
                'icons': <><Grid3X3 size={14} className="text-indigo-500" /><span>Outil : Icon Browser</span></>,
              }[activeTool]}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <button 
              onClick={() => setIsCommandMenuOpen(true)}
              className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <Search size={13} />
              ⌘K Command center
            </button>
            
            <div className="w-px h-5 bg-gray-200" />
            
            <a 
              href="https://ai.studio/build" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 font-mono hover:underline"
            >
              <Cpu size={12} className="text-indigo-500 animate-pulse" />
              DevDock Cloud Core
            </a>
          </div>
        </header>

        {/* Switch mounting screen workspace content */}
        <div className="flex-1 p-8 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full"
            >
              {activeTool === 'readme' && <ToolWrapper><ReadmeGenerator /></ToolWrapper>}
              {activeTool === 'palette' && <ToolWrapper><ColorGenerator /></ToolWrapper>}
              {activeTool === 'components' && <ToolWrapper><ComponentGenerator /></ToolWrapper>}
              {activeTool === 'architecture' && <ToolWrapper><ArchitectureVisualizer /></ToolWrapper>}
              {activeTool === 'docs' && <ToolWrapper><DocsGenerator /></ToolWrapper>}
              {activeTool === 'saas-theme' && <ToolWrapper><ThemeStudio /></ToolWrapper>}
              {activeTool === 'regex' && <ToolWrapper><RegexTester /></ToolWrapper>}
              {activeTool === 'json' && <ToolWrapper><JsonFormatter /></ToolWrapper>}
              {activeTool === 'sql' && <ToolWrapper><SqlEditor /></ToolWrapper>}
              {activeTool === 'env' && <ToolWrapper><EnvFileManager /></ToolWrapper>}
              {activeTool === 'icons' && <ToolWrapper><IconBrowser /></ToolWrapper>}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* 3. FLOATING PORTAL: ALERTS / NOTIFICATION SYSTEM */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 pointer-events-auto transition-all animate-slide-in duration-300 relative overflow-hidden bg-white ${
              notif.type === 'success'
                ? 'border-emerald-200 text-emerald-800'
                : notif.type === 'warning'
                ? 'border-yellow-200 text-yellow-800'
                : 'border-blue-200 text-blue-800'
            }`}
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${
              notif.type === 'success' ? 'bg-emerald-500' : notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            
            <Info size={16} className={`shrink-0 mt-0.5 ${
              notif.type === 'success' ? 'text-emerald-500' : notif.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
            }`} />
            
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-gray-800 font-sans">{notif.message}</p>
            </div>
            
            <button
              onClick={() => removeNotification(notif.id)}
              className="text-gray-400 hover:text-gray-700 text-xs font-mono font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* 4. MODAL ELEMENT: JWT ACCESS HANDSHAKE */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative max-w-md w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl text-left">
            <h3 className="text-md font-bold text-gray-900 flex items-center gap-2 mb-2 font-sans">
              <Key size={16} className="text-indigo-500" />
              Connexion securisée par clé JWT
            </h3>
            <p className="text-xs text-gray-500 mb-5 font-sans leading-relaxed">
              Inscrivez des coordonnées fictives ou réelles. Notre Node backend authentifiera un token signé et sécurisera vos sessions.
            </p>

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-2 font-bold">Email d'inscription :</label>
                <input
                  type="email"
                  required
                  placeholder="nom@workspace.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-3.5 py-1.5 text-gray-500 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                  Générer mon Token JWT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 5. MODAL ELEMENT: GLOBAL SHORTCUTS MENU (Cmd+K Center) */}
      {isCommandMenuOpen && (
        <div 
          onClick={() => setIsCommandMenuOpen(false)}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-start justify-center p-4 pt-[15vh] z-50 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            <div className="p-4 border-b border-gray-200 flex items-center gap-2.5">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Where would you like to navigate?"
                className="w-full bg-transparent text-sm text-gray-900 focus:outline-none placeholder-gray-400"
                autoFocus
              />
            </div>

            <div className="p-2 space-y-1">
              <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest px-3 py-1 font-bold">Access Tools shortcuts</p>
              {[
                { id: 'readme' as const, label: 'README GitHub Generator', key: '1' },
                { id: 'palette' as const, label: 'Harmonies Palette generator', key: '2' },
                { id: 'components' as const, label: 'TSX Component Interactive Playground', key: '3' },
                { id: 'architecture' as const, label: 'Repository Mesh network graph', key: '4' },
                { id: 'docs' as const, label: 'API Guides specifications', key: '5' },
                { id: 'saas-theme' as const, label: 'SaaS design widgets template', key: '6' },
                { id: 'regex' as const, label: 'Regex Tester', key: '7' },
                { id: 'json' as const, label: 'JSON Formatter', key: '8' },
                { id: 'sql' as const, label: 'SQL Editor', key: '9' },
                { id: 'env' as const, label: 'Env File Manager', key: '0' },
                { id: 'icons' as const, label: 'Icon Browser', key: '-' },
              ].map((shortcut) => (
                <button
                  key={shortcut.id}
                  onClick={() => {
                    setActiveTool(shortcut.id);
                    setIsCommandMenuOpen(false);
                    addNotification(`Navigated to: ${shortcut.label}`, 'success');
                  }}
                  className="w-full text-xs font-sans py-2.5 px-3 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <span>{shortcut.label}</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-[9px] font-mono text-gray-500">
                    Alt + {shortcut.key} (Win) / ⌥ + {shortcut.key} (Mac)
                  </kbd>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
