import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useDevDockStore } from '../../store/devdockStore';
import { Search, CheckCircle, Grid3X3, Hash } from 'lucide-react';

const iconCategories: Record<string, { name: string; tags: string[] }[]> = {
  'UI & Navigation': [
    { name: 'Menu', tags: ['hamburger', 'navigation', 'sidebar'] },
    { name: 'X', tags: ['close', 'exit', 'cancel'] },
    { name: 'ArrowLeft', tags: ['back', 'previous', 'direction'] },
    { name: 'ArrowRight', tags: ['next', 'forward', 'direction'] },
    { name: 'ArrowUp', tags: ['up', 'direction', 'arrow'] },
    { name: 'ArrowDown', tags: ['down', 'direction', 'arrow'] },
    { name: 'ChevronLeft', tags: ['collapse', 'left'] },
    { name: 'ChevronRight', tags: ['expand', 'right'] },
    { name: 'ChevronUp', tags: ['up', 'collapse'] },
    { name: 'ChevronDown', tags: ['down', 'expand'] },
    { name: 'Home', tags: ['house', 'dashboard'] },
    { name: 'Search', tags: ['find', 'magnifier', 'lookup'] },
    { name: 'Settings', tags: ['gear', 'preferences', 'configuration'] },
    { name: 'Bell', tags: ['notification', 'alert', 'ring'] },
    { name: 'BellRing', tags: ['notification', 'alert', 'ringing'] },
    { name: 'User', tags: ['person', 'profile', 'account'] },
    { name: 'Users', tags: ['team', 'people', 'group'] },
    { name: 'LogOut', tags: ['exit', 'signout', 'leave'] },
    { name: 'LogIn', tags: ['signin', 'enter', 'login'] },
    { name: 'MoreHorizontal', tags: ['ellipsis', 'more', 'actions'] },
    { name: 'MoreVertical', tags: ['ellipsis', 'more', 'actions'] },
    { name: 'RefreshCw', tags: ['reload', 'sync', 'update'] },
    { name: 'ExternalLink', tags: ['open', 'newtab', 'link'] },
    { name: 'Maximize2', tags: ['fullscreen', 'expand'] },
    { name: 'Minimize2', tags: ['collapse', 'reduce'] },
  ],
  'Layout & Media': [
    { name: 'LayoutGrid', tags: ['grid', 'dashboard', 'cards'] },
    { name: 'LayoutList', tags: ['list', 'rows'] },
    { name: 'Columns3', tags: ['columns', 'masonry'] },
    { name: 'PanelLeft', tags: ['sidebar', 'panel'] },
    { name: 'PanelRight', tags: ['sidebar', 'panel'] },
    { name: 'PanelTop', tags: ['header', 'panel'] },
    { name: 'PanelBottom', tags: ['footer', 'panel'] },
    { name: 'Image', tags: ['photo', 'picture', 'media'] },
    { name: 'Video', tags: ['film', 'camera', 'media'] },
    { name: 'File', tags: ['document', 'generic'] },
    { name: 'FileText', tags: ['document', 'text', 'readme'] },
    { name: 'Folder', tags: ['directory', 'open'] },
    { name: 'FolderOpen', tags: ['directory', 'opened'] },
    { name: 'BookOpenText', tags: ['book', 'documentation', 'docs'] },
    { name: 'Bookmark', tags: ['save', 'favorite'] },
  ],
  'Code & Development': [
    { name: 'Code', tags: ['programming', 'html', 'script'] },
    { name: 'Code2', tags: ['programming', 'brackets'] },
    { name: 'Terminal', tags: ['console', 'shell', 'command'] },
    { name: 'Braces', tags: ['json', 'curly', 'brackets'] },
    { name: 'Brackets', tags: ['array', 'square', 'code'] },
    { name: 'GitBranch', tags: ['git', 'version', 'control'] },
    { name: 'GitCommit', tags: ['git', 'commit'] },
    { name: 'GitPullRequest', tags: ['git', 'pr', 'merge'] },
    { name: 'GitMerge', tags: ['git', 'merge'] },
    { name: 'Github', tags: ['github', 'social', 'code'] },
    { name: 'Globe', tags: ['web', 'internet', 'world'] },
    { name: 'Database', tags: ['db', 'sql', 'storage'] },
    { name: 'Server', tags: ['backend', 'api', 'host'] },
    { name: 'Cloud', tags: ['hosting', 'deploy', 'server'] },
    { name: 'Key', tags: ['api', 'auth', 'token', 'password'] },
    { name: 'Lock', tags: ['secure', 'auth', 'privacy'] },
    { name: 'Unlock', tags: ['open', 'unsecured'] },
    { name: 'Shield', tags: ['security', 'protect', 'safe'] },
    { name: 'Bug', tags: ['debug', 'error', 'issue'] },
    { name: 'TestTube', tags: ['test', 'experiment', 'lab'] },
    { name: 'Workflow', tags: ['pipeline', 'automation', 'ci'] },
    { name: 'Cpu', tags: ['processor', 'hardware', 'compute'] },
  ],
  'AI & Data': [
    { name: 'Sparkles', tags: ['ai', 'magic', 'smart', 'gemini'] },
    { name: 'Brain', tags: ['ai', 'intelligence', 'mind'] },
    { name: 'Wand2', tags: ['magic', 'assistant', 'ai'] },
    { name: 'Stars', tags: ['favorite', 'rating', 'ai'] },
    { name: 'Network', tags: ['graph', 'architecture', 'nodes'] },
    { name: 'Share2', tags: ['share', 'connect', 'network'] },
    { name: 'ScatterChart', tags: ['data', 'chart', 'analytics'] },
    { name: 'BarChart3', tags: ['stats', 'analytics', 'data'] },
    { name: 'PieChart', tags: ['chart', 'stats', 'data'] },
    { name: 'LineChart', tags: ['trend', 'chart', 'data'] },
    { name: 'TrendingUp', tags: ['growth', 'increase', 'chart'] },
    { name: 'TrendingDown', tags: ['decrease', 'decline'] },
    { name: 'Sliders', tags: ['settings', 'controls', 'palette'] },
    { name: 'Palette', tags: ['color', 'theme', 'design'] },
  ],
  'Communication': [
    { name: 'Mail', tags: ['email', 'message', 'contact'] },
    { name: 'Send', tags: ['submit', 'email', 'dispatch'] },
    { name: 'MessageCircle', tags: ['chat', 'comment', 'discuss'] },
    { name: 'MessageSquare', tags: ['chat', 'comment', 'discuss'] },
    { name: 'ChatBubble', tags: ['chat', 'message', 'talk'] },
    { name: 'Bell', tags: ['notification', 'alert'] },
    { name: 'Phone', tags: ['call', 'contact', 'telephone'] },
    { name: 'Share2', tags: ['share', 'forward'] },
    { name: 'ThumbsUp', tags: ['like', 'approve', 'vote'] },
  ],
  'Actions & Tools': [
    { name: 'Plus', tags: ['add', 'new', 'create'] },
    { name: 'Minus', tags: ['remove', 'subtract', 'delete'] },
    { name: 'Check', tags: ['confirm', 'done', 'success'] },
    { name: 'CheckCircle', tags: ['success', 'complete', 'valid'] },
    { name: 'AlertCircle', tags: ['error', 'danger', 'warning'] },
    { name: 'AlertTriangle', tags: ['warning', 'caution', 'danger'] },
    { name: 'Info', tags: ['information', 'help', 'detail'] },
    { name: 'HelpCircle', tags: ['help', 'question', 'support'] },
    { name: 'Copy', tags: ['duplicate', 'clone'] },
    { name: 'Clipboard', tags: ['copy', 'paste', 'board'] },
    { name: 'Trash2', tags: ['delete', 'remove', 'bin'] },
    { name: 'Edit3', tags: ['pen', 'write', 'modify'] },
    { name: 'Pencil', tags: ['edit', 'write', 'draw'] },
    { name: 'Download', tags: ['export', 'save', 'get'] },
    { name: 'Upload', tags: ['import', 'send', 'put'] },
    { name: 'Save', tags: ['floppy', 'store', 'persist'] },
    { name: 'Print', tags: ['printer', 'paper'] },
    { name: 'Filter', tags: ['sort', 'narrow', 'filtering'] },
    { name: 'Play', tags: ['start', 'run', 'execute'] },
    { name: 'StopCircle', tags: ['stop', 'cancel', 'halt'] },
    { name: 'Loader2', tags: ['loading', 'spinner', 'wait'] },
    { name: 'RotateCw', tags: ['refresh', 'reload', 'spin'] },
  ],
  'Shapes & Objects': [
    { name: 'Circle', tags: ['round', 'shape', 'dot'] },
    { name: 'Square', tags: ['shape', 'box', 'rectangle'] },
    { name: 'Triangle', tags: ['shape', 'pyramid'] },
    { name: 'Hexagon', tags: ['shape', 'six'] },
    { name: 'Star', tags: ['favorite', 'rating', 'bookmark'] },
    { name: 'Heart', tags: ['love', 'favorite', 'like'] },
    { name: 'Flag', tags: ['marker', 'priority', 'report'] },
    { name: 'Tag', tags: ['label', 'badge', 'mark'] },
    { name: 'Award', tags: ['badge', 'achievement', 'reward'] },
    { name: 'Gift', tags: ['present', 'bonus', 'reward'] },
    { name: 'Medal', tags: ['badge', 'award', 'achievement'] },
  ],
};

export default function IconBrowser() {
  const { iconSearchQuery, iconSelectedCategory, iconCopiedName, setIconSearchQuery, setIconSelectedCategory, copyIconName } = useDevDockStore();

  const categories = Object.keys(iconCategories);

  const filteredIcons = useMemo(() => {
    const icons = iconSelectedCategory === 'all'
      ? Object.entries(iconCategories).flatMap(([cat, list]) => list.map((ic) => ({ ...ic, category: cat })))
      : (iconCategories[iconSelectedCategory] || []).map((ic) => ({ ...ic, category: iconSelectedCategory }));

    if (!iconSearchQuery.trim()) return icons;

    const q = iconSearchQuery.toLowerCase();
    return icons.filter(
      (ic) =>
        ic.name.toLowerCase().includes(q) ||
        ic.tags.some((t) => t.includes(q))
    );
  }, [iconSearchQuery, iconSelectedCategory]);

  const handleCopy = (name: string) => {
    const importStatement = `import { ${name} } from 'lucide-react';`;
    navigator.clipboard.writeText(importStatement);
    copyIconName(name);
    setTimeout(() => copyIconName(''), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 size={16} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">Icon Browser</h3>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={iconSearchQuery}
            onChange={(e) => setIconSearchQuery(e.target.value)}
            placeholder="Search icons..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={iconSelectedCategory}
          onChange={(e) => setIconSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredIcons.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
            <Hash size={16} className="mr-2" />
            No icons found
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {filteredIcons.map((ic) => (
              <motion.button
                key={ic.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => handleCopy(ic.name)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 hover:bg-gray-100 transition-all cursor-pointer group relative"
                title={`Click to copy: import { ${ic.name} } from 'lucide-react'`}
              >
                {iconCopiedName === ic.name && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-xl z-10">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                )}
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  <span className="text-[10px] font-bold">{ic.name.charAt(0)}</span>
                </div>
                <span className="text-[9px] text-gray-500 font-mono text-center truncate w-full group-hover:text-gray-900 transition-colors">
                  {ic.name}
                </span>
                <span className="text-[7px] text-gray-600 font-mono">
                  {ic.category}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-[10px] text-gray-500">
        <span>{filteredIcons.length} icons</span>
        <span className="font-mono">Click to copy import statement</span>
      </div>
    </div>
  );
}
