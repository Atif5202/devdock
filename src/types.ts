/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

// Outil 1: README types
export interface ReadmeSection {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
}

export interface ReadmeBadge {
  id: string;
  label: string;
  value: string;
  color: string;
  logo?: string;
  enabled: boolean;
}

// Outil 2 & 6: Color Palettes & UI Themes
export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  isFavorite: boolean;
}

export interface ContrastResult {
  ratio: number;
  scoreAA: boolean;
  scoreAAA: boolean;
  scoreAALarge: boolean;
}

// Outil 3: Component Generator
export interface GeneratedComponent {
  id: string;
  name: string;
  type: string; // 'button' | 'navbar' | 'card' | 'modal' | 'dropdown' | 'tabs' | 'widgets'
  variant: string; // 'flat' | 'cyberpunk' | 'neon' | 'glass' | 'minimalist'
  code: string;
  props: Record<string, string | boolean | number>;
}

// Outil 4: Architecture Visualizer
export interface ProjectFileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
  complexity?: 'Low' | 'Medium' | 'High';
  dependencies?: string[];
  children?: ProjectFileNode[];
}

export interface ProjectArchitecture {
  id: string;
  name: string;
  root: ProjectFileNode;
  nodes: { id: string; label: string; group: 'api' | 'ui' | 'db' | 'util' }[];
  links: { source: string; target: string; type: string }[];
  metrics: {
    totalFiles: number;
    linesOfCode: number;
    avgComplexity: string;
    unusedFiles: string[];
  };
}

// Outil 7: Regex Tester
export interface RegexTestResult {
  match: string;
  index: number;
  groups: Record<string, string>;
}

// Outil 8: JSON Formatter
export interface JsonHistoryItem {
  id: string;
  label: string;
  content: string;
  timestamp: number;
}

// Outil 9: SQL Editor
export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, string>[];
  rowCount: number;
  executionTime: number;
}

// Outil 10: Env File Manager
export interface EnvEntry {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  profile: string;
}

export interface EnvProfile {
  id: string;
  name: string;
  entries: EnvEntry[];
}

// Outil 11: Icon Browser
export interface IconEntry {
  name: string;
  component: string;
  category: string;
  tags: string[];
}

// Outil 5: Documentation
export interface DocPage {
  id: string;
  title: string;
  category: string;
  content: string;
}
