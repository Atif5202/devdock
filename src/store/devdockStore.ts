/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { 
  User, 
  ReadmeSection, 
  ReadmeBadge, 
  ColorPalette, 
  GeneratedComponent, 
  ProjectFileNode,
  ProjectArchitecture, 
  DocPage,
  RegexTestResult,
  JsonHistoryItem,
  SqlQueryResult,
  EnvEntry,
  EnvProfile
} from '../types';
import { defaultReadmeSections, defaultBadges, defaultPalette, defaultPaletteHistory, defaultComponentLibrary, defaultProjectArchitectures, defaultDocs } from '../data/defaults';

interface DevDockState {
  // Navigation & General UI
  activeTool: 'readme' | 'palette' | 'components' | 'architecture' | 'docs' | 'saas-theme' | 'regex' | 'json' | 'sql' | 'env' | 'icons';
  globaleSearchQuery: string;
  user: User | null;
  notifications: { id: string; message: string; type: 'success' | 'info' | 'warning' }[];
  
  // Outil 1: README states
  readmeSections: ReadmeSection[];
  readmeBadges: ReadmeBadge[];
  selectedReadmeTheme: 'dark-flat' | 'vercel-bw' | 'cyberpunk-neon' | 'glass-ocean';
  readmeProjectName: string;
  readmeDescription: string;
  loadingReadmeAI: boolean;

  // Outil 2 & 6: Color states
  activePalette: ColorPalette;
  paletteHistory: ColorPalette[];
  paletteQuery: string;
  loadingPaletteAI: boolean;

  // Outil 3: React Component generator states
  componentLibrary: GeneratedComponent[];
  selectedComponent: GeneratedComponent | null;
  loadingComponentAI: boolean;
  selectedComponentVariant: string;

  // Outil 4: Architecture states
  architectures: ProjectArchitecture[];
  activeArchitecture: ProjectArchitecture;
  architectureSearch: string;
  selectedFileContent: { path: string; content: string } | null;

  // Outil 5: Documentation states
  documentationPages: DocPage[];
  selectedDocPage: DocPage | null;
  docTheme: 'modern' | 'minimalist' | 'cyberpunk';
  loadingDocAI: boolean;

  // Outil 7: Regex Tester
  regexPattern: string;
  regexFlags: string;
  regexTestInput: string;
  regexTestResults: RegexTestResult[];
  regexReplaceText: string;
  regexReplacedOutput: string;

  // Outil 8: JSON Formatter
  jsonInput: string;
  jsonOutput: string;
  jsonHistory: JsonHistoryItem[];
  jsonError: string | null;

  // Outil 9: SQL Editor
  sqlInput: string;
  sqlQueryResult: SqlQueryResult | null;
  sqlHistory: string[];
  sqlLoading: boolean;

  // Outil 10: Env File Manager
  envEntries: EnvEntry[];
  envProfiles: EnvProfile[];
  envActiveProfile: string;

  // Outil 11: Icon Browser
  iconSearchQuery: string;
  iconSelectedCategory: string;
  iconCopiedName: string | null;

  // Actions
  setActiveTool: (tool: DevDockState['activeTool']) => void;
  setSearchQuery: (query: string) => void;
  addNotification: (message: string, type: DevDockState['notifications'][0]['type']) => void;
  removeNotification: (id: string) => void;
  login: (email: string) => void;
  logout: () => void;

  // Readme Actions
  updateReadmeSection: (id: string, content: string) => void;
  toggleReadmeSection: (id: string) => void;
  moveReadmeSection: (id: string, direction: 'up' | 'down') => void;
  updateReadmeBadges: (id: string, enabled: boolean) => void;
  setReadmeTheme: (theme: DevDockState['selectedReadmeTheme']) => void;
  setReadmeMeta: (name: string, description: string) => void;
  setLoadingReadmeAI: (val: boolean) => void;
  setReadmeSections: (sections: ReadmeSection[]) => void;
  addReadmeSection: (section: ReadmeSection) => void;
  removeReadmeSection: (id: string) => void;

  // Palette Actions
  setActivePalette: (palette: Partial<ColorPalette>) => void;
  addToHistory: (palette: ColorPalette) => void;
  setLoadingPaletteAI: (val: boolean) => void;
  toggleFavoritePalette: (id: string) => void;

  // Components Actions
  updateComponentCode: (id: string, code: string) => void;
  addComponent: (component: GeneratedComponent) => void;
  removeComponent: (id: string) => void;
  setSelectedComponent: (component: GeneratedComponent | null) => void;
  setLoadingComponentAI: (val: boolean) => void;
  setSelectedComponentVariant: (variant: string) => void;

  // Architecture Actions
  setActiveArchitecture: (id: string) => void;
  uploadArchitectureZip: (name: string, rootNode: ProjectFileNode) => void;
  setArchitectureSearch: (query: string) => void;
  setSelectedFileContent: (file: { path: string; content: string } | null) => void;
  addArchitecture: (arch: ProjectArchitecture) => void;
  deleteArchitecture: (id: string) => void;
  updateArchitecture: (arch: ProjectArchitecture) => void;

  // Documentation Actions
  addDocPage: (page: DocPage) => void;
  setSelectedDocPage: (page: DocPage | null) => void;
  setDocTheme: (theme: DevDockState['docTheme']) => void;
  setLoadingDocAI: (val: boolean) => void;
  setDocumentationPages: (pages: DocPage[]) => void;
  updateSelectedDocPage: (title: string, content: string) => void;
  deleteDocPage: (id: string) => void;

  // Regex Actions
  setRegexPattern: (pattern: string) => void;
  setRegexFlags: (flags: string) => void;
  setRegexTestInput: (input: string) => void;
  runRegexTest: () => void;
  setRegexReplaceText: (text: string) => void;
  runRegexReplace: () => void;

  // JSON Actions
  setJsonInput: (input: string) => void;
  formatJson: () => void;
  minifyJson: () => void;
  validateJson: () => void;
  clearJson: () => void;

  // SQL Actions
  setSqlInput: (input: string) => void;
  runSqlQuery: () => void;
  formatSql: () => void;
  clearSql: () => void;

  // Env Actions
  addEnvEntry: (key: string, value: string) => void;
  updateEnvEntry: (id: string, key: string, value: string) => void;
  removeEnvEntry: (id: string) => void;
  toggleEnvEntry: (id: string) => void;
  setEnvActiveProfile: (profile: string) => void;
  addEnvProfile: (name: string) => void;
  copyEnvToClipboard: () => void;

  // Icon Actions
  setIconSearchQuery: (query: string) => void;
  setIconSelectedCategory: (category: string) => void;
  copyIconName: (name: string) => void;
}

export const useDevDockStore = create<DevDockState>((set, get) => ({
  // Navigation & UI States
  activeTool: 'readme',
  globaleSearchQuery: '',
  user: null,
  notifications: [],

  // Outil 1 README
  readmeSections: defaultReadmeSections,
  readmeBadges: defaultBadges,
  selectedReadmeTheme: 'dark-flat',
  readmeProjectName: 'DevDock Platform',
  readmeDescription: 'An ultra-modern high-performance SaaS developer tool suite.',
  loadingReadmeAI: false,

  // Outil 2 & 6 Palettes
  activePalette: defaultPalette,
  paletteHistory: defaultPaletteHistory,
  paletteQuery: '',
  loadingPaletteAI: false,

  // Outil 3 Components
  componentLibrary: defaultComponentLibrary,
  selectedComponent: defaultComponentLibrary[0],
  loadingComponentAI: false,
  selectedComponentVariant: 'neon',

  // Outil 4 Architecture
  architectures: defaultProjectArchitectures,
  activeArchitecture: defaultProjectArchitectures[0],
  architectureSearch: '',
  selectedFileContent: null,

  // Outil 5 Documentation
  documentationPages: defaultDocs,
  selectedDocPage: defaultDocs[0],
  docTheme: 'modern',
  loadingDocAI: false,

  // Outil 7 Regex Tester
  regexPattern: '',
  regexFlags: 'gm',
  regexTestInput: '',
  regexTestResults: [],
  regexReplaceText: '',
  regexReplacedOutput: '',

  // Outil 8 JSON Formatter
  jsonInput: '',
  jsonOutput: '',
  jsonHistory: [],
  jsonError: null,

  // Outil 9 SQL Editor
  sqlInput: '',
  sqlQueryResult: null,
  sqlHistory: [],
  sqlLoading: false,

  // Outil 10 Env File Manager
  envEntries: [
    { id: 'env-1', key: 'DATABASE_URL', value: 'postgresql://localhost:5432/devdock', enabled: true, profile: 'development' },
    { id: 'env-2', key: 'JWT_SECRET', value: 'your-secret-key-here', enabled: true, profile: 'development' },
    { id: 'env-3', key: 'GEMINI_API_KEY', value: 'AIzaSy...', enabled: true, profile: 'development' },
    { id: 'env-4', key: 'PORT', value: '3000', enabled: true, profile: 'development' },
    { id: 'env-5', key: 'NODE_ENV', value: 'development', enabled: true, profile: 'development' },
  ],
  envProfiles: [
    { id: 'dev', name: 'development', entries: [] },
    { id: 'prod', name: 'production', entries: [] },
    { id: 'staging', name: 'staging', entries: [] },
  ],
  envActiveProfile: 'development',

  // Outil 11 Icon Browser
  iconSearchQuery: '',
  iconSelectedCategory: 'all',
  iconCopiedName: null,

  // System Actions
  setActiveTool: (tool) => set({ activeTool: tool }),
  setSearchQuery: (query) => set({ globaleSearchQuery: query }),
  addNotification: (message, type) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    // Auto clear after 4s
    setTimeout(() => {
      get().removeNotification(id);
    }, 4000);
  },
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),
  login: (email) => set({
    user: {
      id: 'dev-user',
      name: email.split('@')[0].toUpperCase(),
      email: email,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      role: 'SaaS Creator'
    }
  }),
  logout: () => set({ user: null }),

  // Readme Actions
  updateReadmeSection: (id, content) => set((state) => ({
    readmeSections: state.readmeSections.map((sec) => 
      sec.id === id ? { ...sec, content } : sec
    )
  })),
  toggleReadmeSection: (id) => set((state) => ({
    readmeSections: state.readmeSections.map((sec) => 
      sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
    )
  })),
  moveReadmeSection: (id, direction) => set((state) => {
    const idx = state.readmeSections.findIndex((s) => s.id === id);
    if (idx === -1) return {};
    const newSections = [...state.readmeSections];
    if (direction === 'up' && idx > 0) {
      const temp = newSections[idx];
      newSections[idx] = newSections[idx - 1];
      newSections[idx - 1] = temp;
    } else if (direction === 'down' && idx < newSections.length - 1) {
      const temp = newSections[idx];
      newSections[idx] = newSections[idx + 1];
      newSections[idx + 1] = temp;
    }
    return { readmeSections: newSections };
  }),
  updateReadmeBadges: (id, enabled) => set((state) => ({
    readmeBadges: state.readmeBadges.map((bg) => 
      bg.id === id ? { ...bg, enabled } : bg
    )
  })),
  setReadmeTheme: (theme) => set({ selectedReadmeTheme: theme }),
  setReadmeMeta: (name, description) => set({ readmeProjectName: name, readmeDescription: description }),
  setLoadingReadmeAI: (val) => set({ loadingReadmeAI: val }),
  setReadmeSections: (sections) => set({ readmeSections: sections }),
  addReadmeSection: (section) => set((state) => ({
    readmeSections: [...state.readmeSections, section]
  })),
  removeReadmeSection: (id) => set((state) => ({
    readmeSections: state.readmeSections.filter((s) => s.id !== id)
  })),

  // Palette Actions
  setActivePalette: (palette) => set((state) => {
    const updated = { ...state.activePalette, ...palette };
    return { activePalette: updated };
  }),
  addToHistory: (palette) => set((state) => ({
    paletteHistory: [palette, ...state.paletteHistory.filter((p) => p.name !== palette.name)].slice(0, 12)
  })),
  setLoadingPaletteAI: (val) => set({ loadingPaletteAI: val }),
  toggleFavoritePalette: (id) => set((state) => {
    const history = state.paletteHistory.map((p) => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    const active = state.activePalette.id === id 
      ? { ...state.activePalette, isFavorite: !state.activePalette.isFavorite } 
      : state.activePalette;
    return { paletteHistory: history, activePalette: active };
  }),

  // Components Actions
  updateComponentCode: (id, code) => set((state) => {
    const updatedLib = state.componentLibrary.map((c) => 
      c.id === id ? { ...c, code } : c
    );
    const selected = state.selectedComponent && state.selectedComponent.id === id 
      ? { ...state.selectedComponent, code } 
      : state.selectedComponent;
    return { componentLibrary: updatedLib, selectedComponent: selected };
  }),
  addComponent: (comp) => set((state) => ({
    componentLibrary: [...state.componentLibrary, comp],
    selectedComponent: comp
  })),
  removeComponent: (id) => set((state) => {
    const updated = state.componentLibrary.filter((c) => c.id !== id);
    return {
      componentLibrary: updated,
      selectedComponent: updated.length > 0 ? updated[0] : null
    };
  }),
  setSelectedComponent: (comp) => set({ selectedComponent: comp }),
  setLoadingComponentAI: (val) => set({ loadingComponentAI: val }),
  setSelectedComponentVariant: (variant) => set({ selectedComponentVariant: variant }),

  // Architecture Actions
  setActiveArchitecture: (id) => set((state) => {
    const target = state.architectures.find((a) => a.id === id);
    if (!target) return {};
    return { activeArchitecture: target, selectedFileContent: null };
  }),
  uploadArchitectureZip: (name, rootNode) => set((state) => {
    const id = 'uploaded-' + Date.now();
    const newArch: ProjectArchitecture = {
      id,
      name,
      root: rootNode,
      nodes: [
        { id: 'index.js', label: 'Launcher Entrypoint', group: 'api' },
        { id: 'App.jsx', label: 'React Client Root', group: 'ui' },
        { id: 'utils.js', label: 'Utility Formatters', group: 'util' },
      ],
      links: [
        { source: 'index.js', target: 'App.jsx', type: 'mounts' },
        { source: 'App.jsx', target: 'utils.js', type: 'formats' }
      ],
      metrics: {
        totalFiles: 4,
        linesOfCode: 1200,
        avgComplexity: 'Low',
        unusedFiles: ['./test-unused.js']
      }
    };
    return {
      architectures: [newArch, ...state.architectures],
      activeArchitecture: newArch,
      selectedFileContent: null
    };
  }),
  setArchitectureSearch: (query) => set({ architectureSearch: query }),
  setSelectedFileContent: (file) => set({ selectedFileContent: file }),
  addArchitecture: (arch) => set((state) => ({
    architectures: [...state.architectures, arch],
    activeArchitecture: arch,
    selectedFileContent: null
  })),
  deleteArchitecture: (id) => set((state) => {
    const filtered = state.architectures.filter((a) => a.id !== id);
    return {
      architectures: filtered,
      activeArchitecture: filtered[0] || state.activeArchitecture
    };
  }),
  updateArchitecture: (arch) => set((state) => ({
    architectures: state.architectures.map((a) => a.id === arch.id ? arch : a),
    activeArchitecture: arch
  })),

  // Docs Actions
  addDocPage: (page) => set((state) => ({
    documentationPages: [...state.documentationPages, page],
    selectedDocPage: page
  })),
  setSelectedDocPage: (page) => set({ selectedDocPage: page }),
  setDocTheme: (theme) => set({ docTheme: theme }),
  setLoadingDocAI: (val) => set({ loadingDocAI: val }),
  setDocumentationPages: (pages) => set({ documentationPages: pages }),
  updateSelectedDocPage: (title, content) => set((state) => {
    if (!state.selectedDocPage) return {};
    const updated = { ...state.selectedDocPage, title, content };
    return {
      documentationPages: state.documentationPages.map((p) =>
        p.id === state.selectedDocPage!.id ? updated : p
      ),
      selectedDocPage: updated
    };
  }),
  deleteDocPage: (id) => set((state) => {
    const updated = state.documentationPages.filter((p) => p.id !== id);
    return {
      documentationPages: updated,
      selectedDocPage: updated.length > 0 ? updated[0] : null
    };
  }),

  // Regex Actions
  setRegexPattern: (pattern) => set({ regexPattern: pattern }),
  setRegexFlags: (flags) => set({ regexFlags: flags }),
  setRegexTestInput: (input) => set({ regexTestInput: input }),
  runRegexTest: () => set((state) => {
    try {
      const regex = new RegExp(state.regexPattern, state.regexFlags);
      const results: RegexTestResult[] = [];
      let match;
      while ((match = regex.exec(state.regexTestInput)) !== null) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.groups || {},
        });
        if (!state.regexFlags.includes('g')) break;
      }
      return { regexTestResults: results };
    } catch {
      return { regexTestResults: [] };
    }
  }),
  setRegexReplaceText: (text) => set({ regexReplaceText: text }),
  runRegexReplace: () => set((state) => {
    try {
      const regex = new RegExp(state.regexPattern, state.regexFlags);
      const output = state.regexTestInput.replace(regex, state.regexReplaceText);
      return { regexReplacedOutput: output };
    } catch {
      return { regexReplacedOutput: 'Invalid regex pattern' };
    }
  }),

  // JSON Actions
  setJsonInput: (input) => set({ jsonInput: input }),
  formatJson: () => set((state) => {
    try {
      const parsed = JSON.parse(state.jsonInput);
      const output = JSON.stringify(parsed, null, 2);
      const entry: JsonHistoryItem = {
        id: Date.now().toString(),
        label: `Format ${new Date().toLocaleTimeString()}`,
        content: state.jsonInput,
        timestamp: Date.now(),
      };
      return {
        jsonOutput: output,
        jsonError: null,
        jsonHistory: [entry, ...state.jsonHistory].slice(0, 10),
      };
    } catch (e) {
      return { jsonError: (e as Error).message, jsonOutput: '' };
    }
  }),
  minifyJson: () => set((state) => {
    try {
      const parsed = JSON.parse(state.jsonInput);
      return { jsonOutput: JSON.stringify(parsed), jsonError: null };
    } catch (e) {
      return { jsonError: (e as Error).message, jsonOutput: '' };
    }
  }),
  validateJson: () => set((state) => {
    try {
      JSON.parse(state.jsonInput);
      return { jsonError: null };
    } catch (e) {
      return { jsonError: (e as Error).message };
    }
  }),
  clearJson: () => set({ jsonInput: '', jsonOutput: '', jsonError: null }),

  // SQL Actions
  setSqlInput: (input) => set({ sqlInput: input }),
  runSqlQuery: () => set((state) => {
    const start = performance.now();
    const mockColumns = ['id', 'name', 'email', 'status', 'created_at'];
    const mockRows = [
      { id: '1', name: 'Alice Dupont', email: 'alice@devdock.io', status: 'active', created_at: '2025-01-15' },
      { id: '2', name: 'Bob Martin', email: 'bob@devdock.io', status: 'active', created_at: '2025-02-20' },
      { id: '3', name: 'Claire Dubois', email: 'claire@devdock.io', status: 'inactive', created_at: '2025-03-10' },
      { id: '4', name: 'David Lee', email: 'david@devdock.io', status: 'active', created_at: '2025-04-05' },
      { id: '5', name: 'Eva Zhang', email: 'eva@devdock.io', status: 'pending', created_at: '2025-05-12' },
    ];
    const end = performance.now();
    const result: SqlQueryResult = {
      columns: mockColumns,
      rows: mockRows,
      rowCount: mockRows.length,
      executionTime: Math.round((end - start) * 100) / 100,
    };
    return {
      sqlQueryResult: result,
      sqlHistory: [state.sqlInput, ...state.sqlHistory].slice(0, 20),
      sqlLoading: false,
    };
  }),
  formatSql: () => set((state) => {
    const formatted = state.sqlInput
      .replace(/\s+/g, ' ')
      .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|SET|VALUES|INTO|TABLE|INDEX|VIEW|AS|DISTINCT|COUNT|SUM|AVG|MIN|MAX|BETWEEN|LIKE|IN|NOT|NULL|EXISTS|UNION|ALL)\b/g, '\n$1')
      .replace(/,/g, ',\n  ')
      .replace(/  +/g, ' ')
      .trim();
    return { sqlInput: formatted };
  }),
  clearSql: () => set({ sqlInput: '', sqlQueryResult: null, sqlLoading: false }),

  // Env Actions
  addEnvEntry: (key, value) => set((state) => {
    const entry: EnvEntry = {
      id: 'env-' + Date.now(),
      key,
      value,
      enabled: true,
      profile: state.envActiveProfile,
    };
    return { envEntries: [...state.envEntries, entry] };
  }),
  updateEnvEntry: (id, key, value) => set((state) => ({
    envEntries: state.envEntries.map((e) => e.id === id ? { ...e, key, value } : e),
  })),
  removeEnvEntry: (id) => set((state) => ({
    envEntries: state.envEntries.filter((e) => e.id !== id),
  })),
  toggleEnvEntry: (id) => set((state) => ({
    envEntries: state.envEntries.map((e) => e.id === id ? { ...e, enabled: !e.enabled } : e),
  })),
  setEnvActiveProfile: (profile) => set({ envActiveProfile: profile }),
  addEnvProfile: (name) => set((state) => {
    const profile: EnvProfile = {
      id: 'prof-' + Date.now(),
      name,
      entries: [],
    };
    return { envProfiles: [...state.envProfiles, profile] };
  }),
  copyEnvToClipboard: () => {
    const text = get().envEntries
      .filter((e) => e.enabled && e.profile === get().envActiveProfile)
      .map((e) => `${e.key}=${e.value}`)
      .join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  },

  // Icon Actions
  setIconSearchQuery: (query) => set({ iconSearchQuery: query }),
  setIconSelectedCategory: (category) => set({ iconSelectedCategory: category }),
  copyIconName: (name) => set({ iconCopiedName: name }),
}));
