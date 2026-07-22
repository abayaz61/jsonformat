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

// All color themes — shared between JsonEditor, SqlEditor, and RawViewer
export const colorThemeTokens: Record<ColorTheme, ColorPalette> = {
  posthog: {
    dark:  { accent: '#F54E00', string: '#10B981', number: '#C084FC', keyword: '#FBBF24', property: '#FF7A00', bracket: '#94A3B8' },
    light: { accent: '#F54E00', string: '#059669', number: '#9333EA', keyword: '#D97706', property: '#E65100', bracket: '#64748B' },
  },
  ocean: {
    dark:  { accent: '#667eea', string: '#34d399', number: '#f43f5e', keyword: '#fbbf24', property: '#38bdf8', bracket: '#94a3b8' },
    light: { accent: '#4f46e5', string: '#059669', number: '#dc2626', keyword: '#d97706', property: '#0284c7', bracket: '#64748b' },
  },
  forest: {
    dark:  { accent: '#48bb78', string: '#4ade80', number: '#f472b6', keyword: '#facc15', property: '#38bdf8', bracket: '#9ca3af' },
    light: { accent: '#059669', string: '#16a34a', number: '#db2777', keyword: '#ca8a04', property: '#0284c7', bracket: '#4b5563' },
  },
  sunset: {
    dark:  { accent: '#ed8936', string: '#34d399', number: '#c084fc', keyword: '#facc15', property: '#ff7a00', bracket: '#9ca3af' },
    light: { accent: '#ea580c', string: '#059669', number: '#9333ea', keyword: '#d97706', property: '#d97706', bracket: '#4b5563' },
  },
  purple: {
    dark:  { accent: '#9f7aea', string: '#34d399', number: '#fbbf24', keyword: '#f43f5e', property: '#c084fc', bracket: '#9ca3af' },
    light: { accent: '#7c3aed', string: '#059669', number: '#ca8a04', keyword: '#dc2626', property: '#7c3aed', bracket: '#4b5563' },
  },
  rose: {
    dark:  { accent: '#ed64a6', string: '#34d399', number: '#38bdf8', keyword: '#facc15', property: '#f472b6', bracket: '#9ca3af' },
    light: { accent: '#e11d48', string: '#059669', number: '#0284c7', keyword: '#ca8a04', property: '#e11d48', bracket: '#4b5563' },
  },
  midnight: {
    dark:  { accent: '#4fd1c5', string: '#2dd4bf', number: '#f472b6', keyword: '#facc15', property: '#38bdf8', bracket: '#9ca3af' },
    light: { accent: '#0d9488', string: '#0D9488', number: '#db2777', keyword: '#ca8a04', property: '#0284c7', bracket: '#4b5563' },
  },
  crimson: {
    dark:  { accent: '#ef4444', string: '#34d399', number: '#38bdf8', keyword: '#fbbf24', property: '#f87171', bracket: '#9ca3af' },
    light: { accent: '#dc2626', string: '#059669', number: '#0284c7', keyword: '#d97706', property: '#dc2626', bracket: '#4b5563' },
  },
  gold: {
    dark:  { accent: '#eab308', string: '#34d399', number: '#c084fc', keyword: '#fb923c', property: '#facc15', bracket: '#9ca3af' },
    light: { accent: '#ca8a04', string: '#059669', number: '#7c3aed', keyword: '#ea580c', property: '#ca8a04', bracket: '#4b5563' },
  },
  emerald: {
    dark:  { accent: '#10b981', string: '#34d399', number: '#c084fc', keyword: '#fbbf24', property: '#38bdf8', bracket: '#9ca3af' },
    light: { accent: '#047857', string: '#059669', number: '#7c3aed', keyword: '#d97706', property: '#0284c7', bracket: '#4b5563' },
  },
  sapphire: {
    dark:  { accent: '#3b82f6', string: '#34d399', number: '#fb923c', keyword: '#facc15', property: '#60a5fa', bracket: '#9ca3af' },
    light: { accent: '#1d4ed8', string: '#059669', number: '#ea580c', keyword: '#ca8a04', property: '#2563eb', bracket: '#4b5563' },
  },
  amber: {
    dark:  { accent: '#f59e0b', string: '#34d399', number: '#c084fc', keyword: '#f43f5e', property: '#fbbf24', bracket: '#9ca3af' },
    light: { accent: '#d97706', string: '#059669', number: '#7c3aed', keyword: '#dc2626', property: '#d97706', bracket: '#4b5563' },
  },
  indigo: {
    dark:  { accent: '#6366f1', string: '#34d399', number: '#f472b6', keyword: '#facc15', property: '#818cf8', bracket: '#9ca3af' },
    light: { accent: '#4338ca', string: '#059669', number: '#db2777', keyword: '#ca8a04', property: '#4f46e5', bracket: '#4b5563' },
  },
  coral: {
    dark:  { accent: '#f97316', string: '#34d399', number: '#c084fc', keyword: '#facc15', property: '#ff7a00', bracket: '#9ca3af' },
    light: { accent: '#ea580c', string: '#059669', number: '#7c3aed', keyword: '#ca8a04', property: '#ea580c', bracket: '#4b5563' },
  },
  slate: {
    dark:  { accent: '#64748b', string: '#34d399', number: '#c084fc', keyword: '#fbbf24', property: '#38bdf8', bracket: '#9ca3af' },
    light: { accent: '#475569', string: '#059669', number: '#7c3aed', keyword: '#d97706', property: '#0284c7', bracket: '#4b5563' },
  },
  lime: {
    dark:  { accent: '#84cc16', string: '#a3e635', number: '#c084fc', keyword: '#fbbf24', property: '#38bdf8', bracket: '#9ca3af' },
    light: { accent: '#65a30d', string: '#65a30d', number: '#7c3aed', keyword: '#d97706', property: '#0284c7', bracket: '#4b5563' },
  },
  violet: {
    dark:  { accent: '#8b5cf6', string: '#34d399', number: '#f472b6', keyword: '#facc15', property: '#a78bfa', bracket: '#9ca3af' },
    light: { accent: '#7c3aed', string: '#059669', number: '#db2777', keyword: '#ca8a04', property: '#7c3aed', bracket: '#4b5563' },
  },
  bronze: {
    dark:  { accent: '#a16207', string: '#34d399', number: '#c084fc', keyword: '#fbbf24', property: '#f59e0b', bracket: '#9ca3af' },
    light: { accent: '#92400e', string: '#059669', number: '#7c3aed', keyword: '#d97706', property: '#b45309', bracket: '#4b5563' },
  },
  cyan: {
    dark:  { accent: '#06b6d4', string: '#34d399', number: '#c084fc', keyword: '#fbbf24', property: '#22d3ee', bracket: '#9ca3af' },
    light: { accent: '#0891b2', string: '#059669', number: '#7c3aed', keyword: '#d97706', property: '#0891b2', bracket: '#4b5563' },
  },
  magenta: {
    dark:  { accent: '#d946ef', string: '#34d399', number: '#38bdf8', keyword: '#facc15', property: '#e879f9', bracket: '#9ca3af' },
    light: { accent: '#a21caf', string: '#059669', number: '#0284c7', keyword: '#ca8a04', property: '#c026d3', bracket: '#4b5563' },
  },
  olive: {
    dark:  { accent: '#65a30d', string: '#a3e635', number: '#c084fc', keyword: '#fbbf24', property: '#38bdf8', bracket: '#9ca3af' },
    light: { accent: '#4d7c0f', string: '#4d7c0f', number: '#7c3aed', keyword: '#d97706', property: '#0284c7', bracket: '#4b5563' },
  },
};

export function getSyntaxColors(
  colorTheme: ColorTheme,
  mode: 'light' | 'dark'
): SyntaxColors {
  const palette = colorThemeTokens[colorTheme] || colorThemeTokens.posthog;
  const base = mode === 'dark' ? palette.dark : palette.light;
  const neutralPreview = mode === 'dark' ? '#cbd5e1' : '#64748b';

  return {
    accent: base.accent,
    property: base.property,
    string: base.string,
    number: base.number,
    keyword: base.keyword,
    boolean: base.keyword,
    nullValue: mixHexColors(base.bracket, base.keyword, 0.4),
    object: base.bracket,
    array: base.bracket,
    keyString: base.property,
    keyNumber: base.property,
    keyBoolean: base.property,
    keyNull: base.property,
    keyObject: base.property,
    keyArray: base.property,
    bracket: base.bracket,
    preview: mixHexColors(base.bracket, neutralPreview, 0.45),
  };
}

// Global counter — incremented on every define call so Monaco always picks up fresh rules
let _themeVersion = 0;

export const themeBackgroundMap: Record<ColorTheme, { dark: { primary: string; secondary: string }; light: { primary: string; secondary: string } }> = {
  posthog:  { dark: { primary: '#0d0e15', secondary: '#151622' }, light: { primary: '#fffbf9', secondary: '#f8f1ed' } },
  ocean:    { dark: { primary: '#0b0e17', secondary: '#111726' }, light: { primary: '#f5f7ff', secondary: '#ebf0ff' } },
  forest:   { dark: { primary: '#09120d', secondary: '#101f17' }, light: { primary: '#f3faf5', secondary: '#e5f5ea' } },
  sunset:   { dark: { primary: '#140e0a', secondary: '#211710' }, light: { primary: '#fff9f5', secondary: '#fff0e5' } },
  purple:   { dark: { primary: '#100c1a', secondary: '#191329' }, light: { primary: '#f9f5ff', secondary: '#f0e6ff' } },
  rose:     { dark: { primary: '#140b12', secondary: '#21121e' }, light: { primary: '#fff5f9', secondary: '#ffe6f1' } },
  midnight: { dark: { primary: '#091414', secondary: '#102121' }, light: { primary: '#f2fbfb', secondary: '#e1f7f6' } },
  crimson:  { dark: { primary: '#140b0b', secondary: '#221212' }, light: { primary: '#fff5f5', secondary: '#ffe5e5' } },
  gold:     { dark: { primary: '#141209', secondary: '#211e0e' }, light: { primary: '#fffcf2', secondary: '#fff8dc' } },
  emerald:  { dark: { primary: '#091310', secondary: '#10211b' }, light: { primary: '#f2fbf7', secondary: '#e1f7ec' } },
  sapphire: { dark: { primary: '#0a0f1a', secondary: '#11192c' }, light: { primary: '#f4f8ff', secondary: '#e5efff' } },
  amber:    { dark: { primary: '#141009', secondary: '#211a0e' }, light: { primary: '#fffbf2', secondary: '#fff3dc' } },
  indigo:   { dark: { primary: '#0d0c1a', secondary: '#15132b' }, light: { primary: '#f6f5ff', secondary: '#ece9ff' } },
  coral:    { dark: { primary: '#140e0a', secondary: '#221710' }, light: { primary: '#fff8f5', secondary: '#ffede5' } },
  slate:    { dark: { primary: '#0e1015', secondary: '#161a22' }, light: { primary: '#f8fafc', secondary: '#f1f5f9' } },
  lime:     { dark: { primary: '#101309', secondary: '#1b210f' }, light: { primary: '#f9fcf2', secondary: '#f0f9dc' } },
  violet:   { dark: { primary: '#110c1a', secondary: '#1c132b' }, light: { primary: '#f9f5ff', secondary: '#f1e6ff' } },
  bronze:   { dark: { primary: '#120e0a', secondary: '#1f1710' }, light: { primary: '#faf7f2', secondary: '#f3ece0' } },
  cyan:     { dark: { primary: '#081215', secondary: '#0e1f23' }, light: { primary: '#f0fcfd', secondary: '#dff7fa' } },
  magenta:  { dark: { primary: '#140c18', secondary: '#211328' }, light: { primary: '#fcf5fd', secondary: '#f8e6fa' } },
  olive:    { dark: { primary: '#0f1209', secondary: '#191e0e' }, light: { primary: '#f8fcf2', secondary: '#eff9e1' } },
};

/**
 * Defines (or re-defines) a Monaco editor theme for both JSON and SQL modes,
 * consistent with the app's color theme system.
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

  const bgConfig = (themeBackgroundMap[colorTheme] || themeBackgroundMap.posthog)[mode];
  const bgPrimary     = bgConfig.primary;
  const bgSecondary   = bgConfig.secondary;
  const textPrimary   = mode === 'dark' ? '#e2e8f0' : '#1a202c';
  const lineHighlight = mode === 'dark' ? mixHexColors(bgPrimary, tokens.accent, 0.08) : mixHexColors(bgPrimary, tokens.accent, 0.05);
  const selection     = mode === 'dark' ? `${tokens.accent}40` : `${tokens.accent}30`;

  monaco.editor.defineTheme(themeName, {
    base: baseTheme,
    inherit: true,
    rules: [
      // ── JSON ──────────────────────────────────────────────
      { token: 'string',               foreground: tokens.string.replace('#', '') },
      { token: 'string.key.json',      foreground: tokens.property.replace('#', ''), fontStyle: 'bold' },
      { token: 'string.value.json',    foreground: tokens.string.replace('#', '') },
      { token: 'number',               foreground: tokens.number.replace('#', '') },
      { token: 'number.json',          foreground: tokens.number.replace('#', '') },
      { token: 'keyword',              foreground: tokens.boolean.replace('#', ''), fontStyle: 'bold' },
      { token: 'keyword.json',         foreground: tokens.boolean.replace('#', ''), fontStyle: 'bold' },
      { token: 'keyword.true.json',    foreground: tokens.boolean.replace('#', ''), fontStyle: 'bold' },
      { token: 'keyword.false.json',   foreground: tokens.boolean.replace('#', ''), fontStyle: 'bold' },
      { token: 'keyword.null.json',    foreground: tokens.nullValue.replace('#', ''), fontStyle: 'italic' },
      { token: 'delimiter',            foreground: tokens.bracket.replace('#', '') },
      { token: 'delimiter.bracket',    foreground: tokens.bracket.replace('#', '') },
      { token: 'delimiter.bracket.json', foreground: tokens.bracket.replace('#', '') },
      { token: 'delimiter.array.json', foreground: tokens.bracket.replace('#', '') },
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
