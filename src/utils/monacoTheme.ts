import type { Monaco } from '@monaco-editor/react';
import type { ColorTheme } from '@/types';

export interface ThemeColors {
  accent: string;
  string: string;
  number: string;
  keyword: string;
  property: string;
  bracket: string;
}

export interface SyntaxColors {
  accent: string;
  property: string;
  string: string;
  number: string;
  keyword: string;
  boolean: string;
  nullValue: string;
  object: string;
  array: string;
  keyString: string;
  keyNumber: string;
  keyBoolean: string;
  keyNull: string;
  keyObject: string;
  keyArray: string;
  bracket: string;
  preview: string;
}

interface ColorPalette {
  dark: ThemeColors;
  light: ThemeColors;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  const int = Number.parseInt(value, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixHexColors(primary: string, secondary: string, secondaryWeight: number) {
  const base = hexToRgb(primary);
  const mix = hexToRgb(secondary);
  const weight = Math.max(0, Math.min(1, secondaryWeight));

  return rgbToHex(
    base.r * (1 - weight) + mix.r * weight,
    base.g * (1 - weight) + mix.g * weight,
    base.b * (1 - weight) + mix.b * weight,
  );
}

// All 20 color themes — shared between JsonEditor, SqlEditor, and RawViewer
export const colorThemeTokens: Record<ColorTheme, ColorPalette> = {
  ocean: {
    dark:  { accent: '#667eea', string: '#a5d6ff', number: '#79c0ff', keyword: '#ff7b72', property: '#7ee787', bracket: '#8b949e' },
    light: { accent: '#4f46e5', string: '#0550ae', number: '#0969da', keyword: '#cf222e', property: '#116329', bracket: '#57606a' },
  },
  forest: {
    dark:  { accent: '#48bb78', string: '#9ae6b4', number: '#68d391', keyword: '#f6ad55', property: '#90cdf4', bracket: '#a0aec0' },
    light: { accent: '#059669', string: '#047857', number: '#0d9488', keyword: '#c2410c', property: '#1d4ed8', bracket: '#4b5563' },
  },
  sunset: {
    dark:  { accent: '#ed8936', string: '#fbd38d', number: '#f6ad55', keyword: '#fc8181', property: '#90cdf4', bracket: '#a0aec0' },
    light: { accent: '#ea580c', string: '#c2410c', number: '#d97706', keyword: '#dc2626', property: '#2563eb', bracket: '#4b5563' },
  },
  purple: {
    dark:  { accent: '#9f7aea', string: '#d6bcfa', number: '#b794f4', keyword: '#f687b3', property: '#90cdf4', bracket: '#a0aec0' },
    light: { accent: '#7c3aed', string: '#6d28d9', number: '#7c3aed', keyword: '#db2777', property: '#2563eb', bracket: '#4b5563' },
  },
  rose: {
    dark:  { accent: '#ed64a6', string: '#fbb6ce', number: '#f687b3', keyword: '#9f7aea', property: '#90cdf4', bracket: '#a0aec0' },
    light: { accent: '#e11d48', string: '#be185d', number: '#db2777', keyword: '#7c3aed', property: '#2563eb', bracket: '#4b5563' },
  },
  midnight: {
    dark:  { accent: '#4fd1c5', string: '#81e6d9', number: '#76e4f7', keyword: '#f687b3', property: '#90cdf4', bracket: '#a0aec0' },
    light: { accent: '#0d9488', string: '#0f766e', number: '#0891b2', keyword: '#db2777', property: '#2563eb', bracket: '#4b5563' },
  },
  crimson: {
    dark:  { accent: '#ef4444', string: '#fca5a5', number: '#f87171', keyword: '#fbbf24', property: '#6ee7b7', bracket: '#9ca3af' },
    light: { accent: '#dc2626', string: '#b91c1c', number: '#dc2626', keyword: '#b45309', property: '#047857', bracket: '#4b5563' },
  },
  gold: {
    dark:  { accent: '#eab308', string: '#fde047', number: '#facc15', keyword: '#f97316', property: '#a78bfa', bracket: '#9ca3af' },
    light: { accent: '#ca8a04', string: '#a16207', number: '#ca8a04', keyword: '#c2410c', property: '#6d28d9', bracket: '#4b5563' },
  },
  emerald: {
    dark:  { accent: '#10b981', string: '#6ee7b7', number: '#34d399', keyword: '#f472b6', property: '#93c5fd', bracket: '#9ca3af' },
    light: { accent: '#047857', string: '#065f46', number: '#059669', keyword: '#be185d', property: '#1d4ed8', bracket: '#4b5563' },
  },
  sapphire: {
    dark:  { accent: '#3b82f6', string: '#93c5fd', number: '#60a5fa', keyword: '#fb923c', property: '#a5b4fc', bracket: '#9ca3af' },
    light: { accent: '#1d4ed8', string: '#1e40af', number: '#2563eb', keyword: '#c2410c', property: '#4338ca', bracket: '#4b5563' },
  },
  amber: {
    dark:  { accent: '#f59e0b', string: '#fcd34d', number: '#fbbf24', keyword: '#f43f5e', property: '#67e8f9', bracket: '#9ca3af' },
    light: { accent: '#d97706', string: '#b45309', number: '#d97706', keyword: '#be123c', property: '#0e7490', bracket: '#4b5563' },
  },
  indigo: {
    dark:  { accent: '#6366f1', string: '#a5b4fc', number: '#818cf8', keyword: '#fb7185', property: '#86efac', bracket: '#9ca3af' },
    light: { accent: '#4338ca', string: '#3730a3', number: '#4f46e5', keyword: '#be123c', property: '#15803d', bracket: '#4b5563' },
  },
  coral: {
    dark:  { accent: '#f97316', string: '#fdba74', number: '#fb923c', keyword: '#e879f9', property: '#5eead4', bracket: '#9ca3af' },
    light: { accent: '#ea580c', string: '#c2410c', number: '#ea580c', keyword: '#a21caf', property: '#0f766e', bracket: '#4b5563' },
  },
  slate: {
    dark:  { accent: '#64748b', string: '#cbd5e1', number: '#94a3b8', keyword: '#f472b6', property: '#7dd3fc', bracket: '#9ca3af' },
    light: { accent: '#475569', string: '#334155', number: '#475569', keyword: '#be185d', property: '#0284c7', bracket: '#4b5563' },
  },
  lime: {
    dark:  { accent: '#84cc16', string: '#bef264', number: '#a3e635', keyword: '#f472b6', property: '#93c5fd', bracket: '#9ca3af' },
    light: { accent: '#65a30d', string: '#4d7c0f', number: '#65a30d', keyword: '#be185d', property: '#1d4ed8', bracket: '#4b5563' },
  },
  violet: {
    dark:  { accent: '#8b5cf6', string: '#c4b5fd', number: '#a78bfa', keyword: '#38bdf8', property: '#4ade80', bracket: '#9ca3af' },
    light: { accent: '#7c3aed', string: '#5b21b6', number: '#7c3aed', keyword: '#0284c7', property: '#16a34a', bracket: '#4b5563' },
  },
  bronze: {
    dark:  { accent: '#a16207', string: '#fcd34d', number: '#d97706', keyword: '#f87171', property: '#5eead4', bracket: '#9ca3af' },
    light: { accent: '#92400e', string: '#78350f', number: '#a16207', keyword: '#dc2626', property: '#0f766e', bracket: '#4b5563' },
  },
  cyan: {
    dark:  { accent: '#06b6d4', string: '#67e8f9', number: '#22d3ee', keyword: '#f472b6', property: '#a5b4fc', bracket: '#9ca3af' },
    light: { accent: '#0891b2', string: '#0e7490', number: '#0891b2', keyword: '#be185d', property: '#4338ca', bracket: '#4b5563' },
  },
  magenta: {
    dark:  { accent: '#d946ef', string: '#f0abfc', number: '#e879f9', keyword: '#38bdf8', property: '#86efac', bracket: '#9ca3af' },
    light: { accent: '#a21caf', string: '#86198f', number: '#c026d3', keyword: '#0284c7', property: '#15803d', bracket: '#4b5563' },
  },
  olive: {
    dark:  { accent: '#65a30d', string: '#bef264', number: '#84cc16', keyword: '#c084fc', property: '#7dd3fc', bracket: '#9ca3af' },
    light: { accent: '#4d7c0f', string: '#3f6212', number: '#4d7c0f', keyword: '#7c3aed', property: '#0284c7', bracket: '#4b5563' },
  },
};

export function getSyntaxColors(
  colorTheme: ColorTheme,
  mode: 'light' | 'dark'
): SyntaxColors {
  const palette = colorThemeTokens[colorTheme];
  const base = mode === 'dark' ? palette.dark : palette.light;
  const neutralPreview = mode === 'dark' ? '#cbd5e1' : '#64748b';

  return {
    accent: base.accent,
    property: base.property,
    string: base.string,
    number: base.number,
    keyword: base.keyword,
    boolean: mixHexColors(base.keyword, base.accent, mode === 'dark' ? 0.12 : 0.08),
    nullValue: mixHexColors(base.bracket, base.keyword, mode === 'dark' ? 0.3 : 0.18),
    object: mixHexColors(base.property, base.accent, 0.35),
    array: mixHexColors(base.number, base.accent, 0.4),
    keyString: mixHexColors(base.property, base.string, mode === 'dark' ? 0.42 : 0.28),
    keyNumber: mixHexColors(base.property, base.number, mode === 'dark' ? 0.38 : 0.24),
    keyBoolean: mixHexColors(base.property, base.keyword, mode === 'dark' ? 0.34 : 0.22),
    keyNull: mixHexColors(base.property, base.bracket, mode === 'dark' ? 0.48 : 0.3),
    keyObject: mixHexColors(base.property, base.accent, mode === 'dark' ? 0.22 : 0.16),
    keyArray: mixHexColors(base.property, base.number, mode === 'dark' ? 0.22 : 0.16),
    bracket: mixHexColors(base.bracket, base.accent, mode === 'dark' ? 0.18 : 0.1),
    preview: mixHexColors(base.bracket, neutralPreview, 0.45),
  };
}

// Global counter — incremented on every define call so Monaco always picks up fresh rules
let _themeVersion = 0;

/**
 * Defines (or re-defines) a Monaco editor theme for both JSON and SQL modes,
 * consistent with the app's color theme system.
 *
 * Monaco caches themes by name. To force a re-apply when the color theme changes
 * (e.g. ocean → forest) we append an ever-incrementing version suffix so every
 * call always registers a brand-new theme object.
 */
export function defineMonacoTheme(
  monaco: Monaco,
  colorTheme: ColorTheme,
  mode: 'light' | 'dark'
): string {
  const tokens = getSyntaxColors(colorTheme, mode);

  // Always a unique name → Monaco never serves a stale cached version
  const themeName = `custom-${colorTheme}-${mode}-v${++_themeVersion}`;
  const baseTheme = mode === 'dark' ? 'vs-dark' : 'vs';

  const bgPrimary     = mode === 'dark' ? '#0a0a0f' : '#ffffff';
  const bgSecondary   = mode === 'dark' ? '#111118' : '#f8fafc';
  const textPrimary   = mode === 'dark' ? '#e2e8f0' : '#1a202c';
  const lineHighlight = mode === 'dark' ? '#1a1a24' : '#f1f5f9';
  const selection     = mode === 'dark' ? `${tokens.accent}40` : `${tokens.accent}30`;

  monaco.editor.defineTheme(themeName, {
    base: baseTheme,
    inherit: true,
    rules: [
      // ── JSON ──────────────────────────────────────────────
      { token: 'string',               foreground: tokens.string.replace('#', '') },
      { token: 'string.key.json',      foreground: tokens.keyObject.replace('#', '') },
      { token: 'string.value.json',    foreground: tokens.string.replace('#', '') },
      { token: 'number',               foreground: tokens.number.replace('#', '') },
      { token: 'number.json',          foreground: tokens.number.replace('#', '') },
      { token: 'keyword',              foreground: tokens.boolean.replace('#', '') },
      { token: 'keyword.json',         foreground: tokens.boolean.replace('#', '') },
      { token: 'keyword.true.json',    foreground: tokens.boolean.replace('#', '') },
      { token: 'keyword.false.json',   foreground: tokens.boolean.replace('#', '') },
      { token: 'keyword.null.json',    foreground: tokens.nullValue.replace('#', ''), fontStyle: 'italic' },
      { token: 'delimiter',            foreground: tokens.bracket.replace('#', '') },
      { token: 'delimiter.bracket',    foreground: tokens.object.replace('#', '') },
      { token: 'delimiter.bracket.json', foreground: tokens.object.replace('#', '') },
      { token: 'delimiter.array.json', foreground: tokens.array.replace('#', '') },
      { token: 'delimiter.colon.json', foreground: tokens.bracket.replace('#', '') },
      { token: 'delimiter.comma.json', foreground: tokens.bracket.replace('#', '') },

      // ── SQL ───────────────────────────────────────────────
      { token: 'keyword.sql',          foreground: tokens.keyword.replace('#', ''), fontStyle: 'bold' },
      { token: 'operator.sql',         foreground: tokens.accent.replace('#', '') },
      { token: 'string.sql',           foreground: tokens.string.replace('#', '') },
      { token: 'string.escape.sql',    foreground: tokens.string.replace('#', '') },
      { token: 'number.sql',           foreground: tokens.number.replace('#', '') },
      { token: 'comment.sql',          foreground: tokens.bracket.replace('#', ''), fontStyle: 'italic' },
      { token: 'comment.quote.sql',    foreground: tokens.bracket.replace('#', ''), fontStyle: 'italic' },
      { token: 'predefined.sql',       foreground: tokens.property.replace('#', '') },
      { token: 'identifier.sql',       foreground: textPrimary.replace('#', '') },
    ],
    colors: {
      'editor.background':                   bgPrimary,
      'editor.foreground':                   textPrimary,
      'editor.lineHighlightBackground':      lineHighlight,
      'editor.selectionBackground':          selection,
      'editor.inactiveSelectionBackground':  `${tokens.accent}20`,
      'editorCursor.foreground':             tokens.accent,
      'editorLineNumber.foreground':         mode === 'dark' ? '#4a5568' : '#a0aec0',
      'editorLineNumber.activeForeground':   tokens.accent,
      'editorGutter.background':             bgSecondary,
      'editorBracketMatch.background':       `${tokens.accent}30`,
      'editorBracketMatch.border':           tokens.accent,
      'editorIndentGuide.background1':       mode === 'dark' ? '#2d3748' : '#e2e8f0',
      'editorIndentGuide.activeBackground1': tokens.accent,
      'scrollbarSlider.background':          `${tokens.accent}30`,
      'scrollbarSlider.hoverBackground':     `${tokens.accent}50`,
      'scrollbarSlider.activeBackground':    `${tokens.accent}70`,
    },
  });

  return themeName;
}
