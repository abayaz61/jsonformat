'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DiffEditor, Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useTheme, useSettings, useLanguage } from '@/contexts';
import { defineMonacoTheme, getSyntaxColors } from '@/utils/monacoTheme';
import { ArrowLeftRight, Copy, Check, Trash2, Wand2, AlignLeft } from 'lucide-react';
import { copyToClipboard } from '@/utils/clipboard';

interface JsonDiffProps {
  initialContent: string;
}

const SAMPLE_ORIGINAL = JSON.stringify(
  {
    service: 'auth-api',
    version: '1.2.0',
    port: 8080,
    features: {
      enableOAuth: true,
      enableMFA: false,
      maxSessions: 5,
    },
    database: {
      host: 'db.internal.net',
      poolSize: 10,
    },
    usersCount: 1420,
  },
  null,
  2
);

const SAMPLE_MODIFIED = JSON.stringify(
  {
    service: 'auth-api',
    version: '1.3.0',
    port: 8080,
    features: {
      enableOAuth: true,
      enableMFA: true,
      maxSessions: 10,
      enableSSO: true,
    },
    database: {
      host: 'db-cluster.internal.net',
      poolSize: 20,
    },
    usersCount: 1850,
  },
  null,
  2
);

function formatJsonText(text: string): string {
  if (!text.trim()) return '';
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text;
  }
}

export function JsonDiff({ initialContent }: JsonDiffProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { t } = useLanguage();

  const [leftContent, setLeftContent] = useState<string>(() => initialContent || SAMPLE_ORIGINAL);
  const [rightContent, setRightContent] = useState<string>(() => (initialContent ? '' : SAMPLE_MODIFIED));
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);
  const [currentThemeName, setCurrentThemeName] = useState<string>('vs-dark');

  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const syntaxColors = getSyntaxColors(theme.color, theme.mode);

  const handleMount = (diffEditor: editor.IStandaloneDiffEditor, monaco: Monaco) => {
    diffEditorRef.current = diffEditor;
    monacoRef.current = monaco;

    const themeName = defineMonacoTheme(monaco, theme.color, theme.mode);
    monaco.editor.setTheme(themeName);
    setCurrentThemeName(themeName);
  };

  useEffect(() => {
    if (monacoRef.current) {
      const themeName = defineMonacoTheme(monacoRef.current, theme.color, theme.mode);
      monacoRef.current.editor.setTheme(themeName);
      setCurrentThemeName(themeName);
    }
  }, [theme.color, theme.mode]);

  const handleSwap = useCallback(() => {
    setLeftContent(rightContent);
    setRightContent(leftContent);
  }, [leftContent, rightContent]);

  const handleFormat = useCallback(() => {
    setLeftContent((prev) => formatJsonText(prev));
    setRightContent((prev) => formatJsonText(prev));
  }, []);

  const handleLoadSample = useCallback(() => {
    setLeftContent(SAMPLE_ORIGINAL);
    setRightContent(SAMPLE_MODIFIED);
  }, []);

  const handleClear = useCallback(() => {
    setLeftContent('');
    setRightContent('');
  }, []);

  const handleCopyLeft = useCallback(async () => {
    if (!leftContent) return;
    const ok = await copyToClipboard(leftContent);
    if (ok) {
      setCopiedLeft(true);
      setTimeout(() => setCopiedLeft(false), 2000);
    }
  }, [leftContent]);

  const handleCopyRight = useCallback(async () => {
    if (!rightContent) return;
    const ok = await copyToClipboard(rightContent);
    if (ok) {
      setCopiedRight(true);
      setTimeout(() => setCopiedRight(false), 2000);
    }
  }, [rightContent]);

  return (
    <div className="diff-container">
      {/* Diff Toolbar */}
      <div className="diff-toolbar">
        <div className="diff-toolbar-group">
          <button
            className="diff-toolbar-btn"
            onClick={handleSwap}
            title={t.diff?.swap ?? 'Yer Değiştir (Swap)'}
          >
            <ArrowLeftRight size={14} />
            <span>{t.diff?.swap ?? 'Yer Değiştir'}</span>
          </button>

          <button
            className="diff-toolbar-btn"
            onClick={handleFormat}
            title={t.diff?.formatBoth ?? 'İki Tarafı da Biçimlendir'}
          >
            <AlignLeft size={14} />
            <span>{t.toolbar?.format ?? 'Biçimlendir'}</span>
          </button>

          <button
            className="diff-toolbar-btn"
            onClick={handleLoadSample}
            title={t.diff?.loadSample ?? 'Örnek Yükle'}
          >
            <Wand2 size={14} />
            <span>{t.diff?.sample ?? 'Örnek'}</span>
          </button>
        </div>

        <div className="diff-toolbar-group">
          <button
            className="diff-toolbar-btn"
            onClick={handleCopyLeft}
            disabled={!leftContent.trim()}
          >
            {copiedLeft ? <Check size={14} /> : <Copy size={14} />}
            <span>{t.diff?.copyOriginal ?? 'Sol Kopyala'}</span>
          </button>

          <button
            className="diff-toolbar-btn"
            onClick={handleCopyRight}
            disabled={!rightContent.trim()}
          >
            {copiedRight ? <Check size={14} /> : <Copy size={14} />}
            <span>{t.diff?.copyModified ?? 'Sağ Kopyala'}</span>
          </button>

          <button
            className="diff-toolbar-btn diff-toolbar-btn-danger"
            onClick={handleClear}
            disabled={!leftContent && !rightContent}
          >
            <Trash2 size={14} />
            <span>{t.toolbar?.clear ?? 'Temizle'}</span>
          </button>
        </div>
      </div>

      {/* Pane Headers */}
      <div className="diff-pane-headers">
        <div className="diff-pane-header">
          <span className="diff-pane-dot diff-pane-dot-original" />
          <span className="diff-pane-title">{t.diff?.original ?? 'Sol (Orijinal)'}</span>
        </div>
        <div className="diff-pane-header">
          <span className="diff-pane-dot diff-pane-dot-modified" />
          <span className="diff-pane-title">{t.diff?.modified ?? 'Sağ (Karşılaştırılan / Değişen)'}</span>
        </div>
      </div>

      {/* Monaco Diff Editor */}
      <div className="diff-editor-wrapper">
        <DiffEditor
          height="100%"
          language="json"
          original={leftContent}
          modified={rightContent}
          onMount={handleMount}
          theme={currentThemeName}
          options={{
            fontSize: settings.fontSize,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            originalEditable: true,
            readOnly: false,
            renderSideBySide: true,
            padding: { top: 12, bottom: 12 },
            fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
            wordSeparators: ' \t\r\n',
          }}
          loading={null}
        />
      </div>
    </div>
  );
}
