import type { ReadmeSection, ReadmeBadge, ColorPalette, GeneratedComponent, ProjectArchitecture, DocPage } from '../types';

export const defaultReadmeSections: ReadmeSection[] = [
  {
    id: 'intro',
    title: 'Description',
    content: '### DevDock Core Platform\n\nDevDock is an ultra-modern suite designed for developers. It simplifies development workflows by organizing resources, visualizing code architectural links, generating beautiful theme config palettes, and automating documentations with cutting-edge layouts.',
    enabled: true
  },
  {
    id: 'features',
    title: 'Features',
    content: '- **Interactive Architecture Graph**: Visualize components, utility hooks, and system relationships dynamically with interactive rendering.\n- **Custom Component Workbench**: Build stateful responsive buttons, dialog boxes, and navigation sidebars with preview controllers.\n- **SaaS Theme Studio**: Direct exports of fully harmonized Tailwind core colors, CSS variables, and styled widgets.\n- **GitHub Markdown Builder**: Complete interactive live markdown generation featuring badging presets and AI-suggested content boards.',
    enabled: true
  },
  {
    id: 'install',
    title: 'Installation',
    content: 'Get started in seconds with these simple terminal commands:\n\n```bash\n# Clone the repository\ngit clone https://github.com/developer/devdock-workspace.git\n\n# Navigate to project root\ncd devdock-workspace\n\n# Install modular dependencies\nnpm install\n\n# Initialize local environments\nnpm run dev\n```',
    enabled: true
  },
  {
    id: 'roadmap',
    title: 'Project Roadmap',
    content: '- [x] Build core components studio\n- [x] Configure real-time accessibility contrast checkers\n- [ ] Integrate collaborative live-sync team modules\n- [ ] Launch IDE-extension companion bindings',
    enabled: true
  },
  {
    id: 'license',
    title: 'License',
    content: 'Distributed under the **MIT License**. Read the `LICENSE` file for broad-range permission guidelines.',
    enabled: true
  }
];

export const defaultBadges: ReadmeBadge[] = [
  { id: 'version', label: 'Version', value: 'v1.4.2', color: '3b82f6', enabled: true },
  { id: 'license', label: 'License', value: 'MIT', color: '10b981', enabled: true },
  { id: 'build', label: 'Build', value: 'passing', color: '10b981', enabled: true },
  { id: 'node', label: 'Node', value: '>=18.0.0', color: '6366f1', enabled: false },
  { id: 'stars', label: 'Stars', value: '1.2k', color: 'f59e0b', enabled: true },
];

export const defaultPalette: ColorPalette = {
  id: 'preset-slate',
  name: 'Oceanic Slate (Modern)',
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#6366f1',
  background: '#090d16',
  surface: '#111827',
  text: '#f3f4f6',
  isFavorite: true
};

export const defaultPaletteHistory: ColorPalette[] = [
  defaultPalette,
  {
    id: 'preset-cyberpunk',
    name: 'Cyberpunk District',
    primary: '#ff007f',
    secondary: '#00f0ff',
    accent: '#ffaa00',
    background: '#0a0512',
    surface: '#150c26',
    text: '#ffffff',
    isFavorite: false
  },
  {
    id: 'preset-vercel',
    name: 'Vercel Monochrome',
    primary: '#ffffff',
    secondary: '#a3a3a3',
    accent: '#3b82f6',
    background: '#000000',
    surface: '#0a0a0a',
    text: '#f5f5f5',
    isFavorite: true
  },
  {
    id: 'preset-retro',
    name: 'Emerald Terminal',
    primary: '#10b981',
    secondary: '#34d399',
    accent: '#fbbf24',
    background: '#040d0a',
    surface: '#0c1a14',
    text: '#edfcf7',
    isFavorite: false
  }
];

export const defaultComponentLibrary: GeneratedComponent[] = [
  {
    id: 'comp-btn',
    name: 'Interactive Button',
    type: 'button',
    variant: 'neon',
    code: `import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function ShimmerButton({ children = "Execute command", onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.98 }}
      className="relative px-6 py-2.5 rounded-xl font-medium text-white transition-all overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 shadow-lg shadow-indigo-500/20"
    >
      <span className="flex items-center gap-2 relative z-10">
        <Sparkles size={16} className={isHovered ? "animate-spin text-amber-200" : "text-white"} />
        {children}
      </span>
      <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
    </motion.button>
  );
}`,
    props: { text: 'Deploy to Cloud', size: 'medium', disabled: false }
  },
  {
    id: 'comp-card',
    name: 'Glassmorphic Widget Card',
    type: 'card',
    variant: 'glass',
    code: `import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Cpu } from 'lucide-react';

export default function GlassWidgetsCard({ title = "CPU Cluster Node", subtitle = "Cluster live latency", metric = "4.2 ms" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <button className="text-gray-400 hover:text-white transition-colors duration-200">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold font-mono tracking-tight text-white mt-1">{metric}</h3>
        <p className="text-xs text-emerald-400 font-mono mt-2 flex items-center gap-1">
          <span>●</span> {subtitle}
        </p>
      </div>
    </motion.div>
  );
}`,
    props: { title: 'Network Overhead', metric: '1.24 GB/s', color: 'indigo' }
  },
  {
    id: 'comp-modal',
    name: 'Sleek Dev Alert Dialog',
    type: 'modal',
    variant: 'cyberpunk',
    code: `import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

export default function CyberpunkDialog({ isOpen = true, onClose, title = "DATABASE MUTATION WARNING" }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={onClose}
        className="absolute inset-0 bg-[#020205]/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md p-6 bg-black border-2 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)] rounded-none"
      >
        <div className="absolute top-0 left-0 w-3 h-3 bg-pink-500" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-pink-500" />
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-md font-mono text-pink-500 tracking-wider flex items-center gap-2">
            <AlertCircle size={18} className="text-pink-500 animate-pulse" />
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm font-sans text-gray-300 leading-relaxed mb-6">
          This operation will apply irreversible cascading migrations directly on the main DB schema. 
          Are you sure you want to proceed with full table locking?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 font-mono text-xs border border-gray-700 text-gray-400 hover:bg-white/5 transition-colors">
            CANCEL
          </button>
          <button onClick={onClose} className="px-4 py-2 font-mono text-xs bg-pink-600 text-white hover:bg-pink-500 shadow-md">
            CONFIRM MUTATION
          </button>
        </div>
      </motion.div>
    </div>
  );
}`,
    props: { title: 'DANGER: LIVE BRANCH REBASE', confirmText: 'Proceed' }
  }
];

export const defaultProjectArchitectures: ProjectArchitecture[] = [
  {
    id: 'arch-express',
    name: 'Clean Full-Stack Server Suite',
    root: {
      name: 'root',
      path: '.',
      type: 'directory',
      children: [
        {
          name: 'src',
          path: './src',
          type: 'directory',
          children: [
            {
              name: 'components',
              path: './src/components',
              type: 'directory',
              children: [
                { name: 'Navbar.tsx', path: './src/components/Navbar.tsx', type: 'file', size: 1204, language: 'TypeScript', complexity: 'Low' },
                { name: 'Sidebar.tsx', path: './src/components/Sidebar.tsx', type: 'file', size: 4208, language: 'TypeScript', complexity: 'Medium', dependencies: ['./src/components/Navbar.tsx'] },
                { name: 'Dashboard.tsx', path: './src/components/Dashboard.tsx', type: 'file', size: 6150, language: 'TypeScript', complexity: 'High', dependencies: ['./src/components/Sidebar.tsx', './src/types.ts'] },
              ]
            },
            {
              name: 'services',
              path: './src/services',
              type: 'directory',
              children: [
                { name: 'ai.ts', path: './src/services/ai.ts', type: 'file', size: 2110, language: 'TypeScript', complexity: 'Medium' },
                { name: 'auth.ts', path: './src/services/auth.ts', type: 'file', size: 3402, language: 'TypeScript', complexity: 'High' },
              ]
            },
            { name: 'App.tsx', path: './src/App.tsx', type: 'file', size: 4500, language: 'TypeScript', complexity: 'Medium', dependencies: ['./src/components/Dashboard.tsx', './src/services/auth.ts'] },
            { name: 'types.ts', path: './src/types.ts', type: 'file', size: 850, language: 'TypeScript', complexity: 'Low' },
          ]
        },
        { name: 'server.ts', path: './server.ts', type: 'file', size: 3120, language: 'TypeScript', complexity: 'High', dependencies: ['./src/services/auth.ts'] },
        { name: 'package.json', path: './package.json', type: 'file', size: 955, language: 'JSON', complexity: 'Low' },
      ]
    },
    nodes: [
      { id: 'server.ts', label: 'Backend Server (Express)', group: 'api' },
      { id: 'App.tsx', label: 'App Controller Launcher', group: 'ui' },
      { id: 'Dashboard.tsx', label: 'Dashboard Module', group: 'ui' },
      { id: 'Sidebar.tsx', label: 'Sleek Sidebar Navigation', group: 'ui' },
      { id: 'Navbar.tsx', label: 'Status Header Navbar', group: 'ui' },
      { id: 'auth.ts', label: 'JWT Auth Engine', group: 'db' },
      { id: 'ai.ts', label: 'Gemini AI API Broker', group: 'util' },
    ],
    links: [
      { source: 'server.ts', target: 'auth.ts', type: 'validates' },
      { source: 'App.tsx', target: 'auth.ts', type: 'initializes' },
      { source: 'App.tsx', target: 'Dashboard.tsx', type: 'mounts' },
      { source: 'Dashboard.tsx', target: 'Sidebar.tsx', type: 'includes' },
      { source: 'Sidebar.tsx', target: 'Navbar.tsx', type: 'aligns' },
      { source: 'Dashboard.tsx', target: 'ai.ts', type: 'queries' },
    ],
    metrics: {
      totalFiles: 14,
      linesOfCode: 4210,
      avgComplexity: 'Medium-High',
      unusedFiles: ['./src/utils/legacy-formatter.js', './src/components/old-modal.css']
    }
  },
  {
    id: 'arch-spa',
    name: 'Vite React Boilerplate SPA',
    root: {
      name: 'root',
      path: '.',
      type: 'directory',
      children: [
        { name: 'App.tsx', path: './App.tsx', type: 'file', size: 1040, language: 'TypeScript', complexity: 'Low' },
        { name: 'main.tsx', path: './main.tsx', type: 'file', size: 620, language: 'TypeScript', complexity: 'Low' },
        { name: 'vite.config.ts', path: './vite.config.ts', type: 'file', size: 810, language: 'TypeScript', complexity: 'Low' },
      ]
    },
    nodes: [
      { id: 'main.tsx', label: 'Client Entry (main.tsx)', group: 'ui' },
      { id: 'App.tsx', label: 'App Component (App.tsx)', group: 'ui' },
      { id: 'vite.config.ts', label: 'Vite Bundler Configuration', group: 'util' },
    ],
    links: [
      { source: 'main.tsx', target: 'App.tsx', type: 'imports' },
      { source: 'vite.config.ts', target: 'main.tsx', type: 'configures' }
    ],
    metrics: {
      totalFiles: 3,
      linesOfCode: 247,
      avgComplexity: 'Low',
      unusedFiles: []
    }
  }
];

export const defaultDocs: DocPage[] = [
  {
    id: 'doc-intro',
    category: 'Getting Started',
    title: 'Platform Introduction',
    content: `# Welcome to DevDock Workspace

DevDock is an ultra-modern workspace engineering beautiful, reliable platforms for software developers and designers. 

### Why DevDock?

Standard codebases suffer from tooling fragmentation. Developers use distinct tools for markdown building, color system design, component proofing, and schema checking. DevDock unifies these workspaces in an eye-safe environment.

## Key Modules

1. **Intelligent Markdown (README) Studio**: Build high-impact, custom-branded landing descriptors for repository deployments.
2. **Dynamic UI Theme Board**: Compute and copy perfect CSS color maps with high-contrast accessibility ratios verified automatically.
3. **Interactive TSX Workbench**: Code stateful buttons, sheets, and menus in a live context with modular property inputs.
4. **Project Architecture Graph**: Analyze zip repositories to map node-relationship meshes and detect unused structures.

Enjoy building in standard-compliant workspace!
`
  },
  {
    id: 'doc-api',
    category: 'API Protocols',
    title: 'JWT Backend Integration',
    content: `# Backend API Protocols

DevDock communicates seamlessly with our secure Node/Express wrapper using structured state containers.

### 1. Token Handshake
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "developer@devdock.io"
}
\`\`\`
\`\`\`

### 2. Client Response Payload
\`\`\`json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "DevDock Engineer",
    "role": "Lead Architect"
  }
}
\`\`\`

All transactions authenticate through the standard headers: \`Authorization: Bearer <token>\`. Keep keys encrypted globally!
`
  },
  {
    id: 'doc-components',
    category: 'Custom Components',
    title: 'Styling with Tailwind Variables',
    content: `# Core Visual Themes

Our generated schemas integrate tightly with Tailwind configuration systems. Use standard CSS variables for seamless light/dark handshakes!

### Customizing Tailwind Config:
\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
          background: 'var(--brand-background)'
        }
      }
    }
  }
}
\`\`\`

This guarantees your app layouts swap instantly when user palettes modify!
`
  }
];
