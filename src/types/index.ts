// Type definitions for JSON Formatter Tool

export interface Theme {
  mode: 'light' | 'dark';
  color: ColorTheme;
}

// 20 Color Themes
export type ColorTheme =
  | 'ocean'      // Blue
  | 'forest'     // Green
  | 'sunset'     // Orange
  | 'purple'     // Purple
  | 'rose'       // Pink
  | 'midnight'   // Teal
  | 'crimson'    // Red
  | 'gold'       // Yellow/Gold
  | 'emerald'    // Emerald Green
  | 'sapphire'   // Deep Blue
  | 'amber'      // Amber
  | 'indigo'     // Indigo
  | 'coral'      // Coral
  | 'slate'      // Gray/Slate
  | 'lime'       // Lime Green
  | 'violet'     // Violet
  | 'bronze'     // Bronze/Brown
  | 'cyan'       // Cyan
  | 'magenta'    // Magenta
  | 'olive';     // Olive

export type Language = 'en' | 'tr' | 'de' | 'it' | 'fr' | 'zh';

export interface Settings {
  theme: Theme;
  language: Language;
  indentSize: number;
  fontSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
}

export interface JsonValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
}

export interface TranslationStrings {
  header: {
    title: string;
    subtitle: string;
  };
  toolbar: {
    format: string;
    minify: string;
    copy: string;
    paste: string;
    download: string;
    upload: string;
    clear: string;
    fullscreen: string;
    exitFullscreen: string;
    export: string;
  };
  settings: {
    title: string;
    theme: string;
    language: string;
    colorTheme: string;
    fontSize: string;
    indentSize: string;
    wordWrap: string;
    lineNumbers: string;
    minimap: string;
  };
  messages: {
    copied: string;
    downloaded: string;
    cleared: string;
    invalidJson: string;
    formatted: string;
    minified: string;
    pasteError: string;
    uploadError: string;
  };
  exportModal: {
    title: string;
    invalidJson: string;
    copy: string;
    copied: string;
  };
  installPrompt: {
    title: string;
    description: string;
    benefit1Title: string;
    benefit1Desc: string;
    benefit2Title: string;
    benefit2Desc: string;
    benefit3Title: string;
    benefit3Desc: string;
    later: string;
    install: string;
  };
  privacyNotice: {
    title: string;
    subtitle: string;
    description: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    button: string;
  };
  themes: Record<string, string>;
}
