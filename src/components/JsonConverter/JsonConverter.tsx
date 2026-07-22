'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useTheme, useSettings, useLanguage } from '@/contexts';
import { defineMonacoTheme } from '@/utils/monacoTheme';
import { convertFormat, TargetFormat } from '@/utils/converters';
import { downloadJson } from '@/utils/fileOperations';
import { copyToClipboard } from '@/utils/clipboard';
import { Copy, Check, Download, ArrowLeftRight, Wand2, RefreshCw } from 'lucide-react';

interface JsonConverterProps {
  initialContent: string;
}

const FORMAT_OPTIONS: { id: TargetFormat; label: string; badge: string }[] = [
  { id: 'yaml', label: 'YAML', badge: 'Data' },
  { id: 'xml', label: 'XML', badge: 'Data' },
  { id: 'csv', label: 'CSV (Excel)', badge: 'Data' },
  { id: 'toml', label: 'TOML', badge: 'Data' },
  { id: 'env', label: '.ENV File', badge: 'Data' },
  { id: 'typescript', label: 'TypeScript', badge: 'Code' },
  { id: 'csharp', label: 'C# Class', badge: 'Code' },
  { id: 'go', label: 'Go Struct', badge: 'Code' },
  { id: 'python', label: 'Python', badge: 'Code' },
  { id: 'java', label: 'Java Class', badge: 'Code' },
  { id: 'dart', label: 'Dart / Flutter', badge: 'Code' },
];

const SAMPLE_CONVERT_JSON = JSON.stringify(
  {
    userId: 10482,
    userName: 'alex_developer',
    email: 'alex@example.com',
    isActive: true,
    roles: ['admin', 'developer'],
    profile: {
      firstName: 'Alex',
      lastName: 'Smith',
      age: 29,
    },
    projects: [
      { id: 'p1', title: 'JSON Formatter Pro', status: 'completed' },
      { id: 'p2', title: 'API Gateway', status: 'in_progress' },
    ],
  },
  null,
  2
);

export function JsonConverter({ initialContent }: JsonConverterProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { t } = useLanguage();

  const [inputContent, setInputContent] = useState<string>(() => initialContent || SAMPLE_CONVERT_JSON);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('yaml');
  const [copied, setCopied] = useState(false);
  const [currentThemeName, setCurrentThemeName] = useState<string>('vs-dark');

  const inputMonacoRef = useRef<Monaco | null>(null);
  const outputMonacoRef = useRef<Monaco | null>(null);

  // Perform conversion
  const { output, monacoLanguage, extension } = useMemo(() => {
    return convertFormat(inputContent, targetFormat);
  }, [inputContent, targetFormat]);

  const handleInputMount = (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    inputMonacoRef.current = monaco;
    const themeName = defineMonacoTheme(monaco, theme.color, theme.mode);
    monaco.editor.setTheme(themeName);
    setCurrentThemeName(themeName);
  };

  const handleOutputMount = (_editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    outputMonacoRef.current = monaco;
    const themeName = defineMonacoTheme(monaco, theme.color, theme.mode);
    monaco.editor.setTheme(themeName);
    setCurrentThemeName(themeName);
  };

  useEffect(() => {
    if (inputMonacoRef.current) {
      const themeName = defineMonacoTheme(inputMonacoRef.current, theme.color, theme.mode);
      inputMonacoRef.current.editor.setTheme(themeName);
      setCurrentThemeName(themeName);
    }
  }, [theme.color, theme.mode]);

  const handleSwap = useCallback(() => {
    if (!output.trim()) return;
    setInputContent(output);
  }, [output]);

  const handleLoadSample = useCallback(() => {
    setInputContent(SAMPLE_CONVERT_JSON);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output.trim()) return;
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output.trim()) return;
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `converted-data-${timestamp}.${extension}`;
    
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [output, extension]);

  return (
    <div className="converter-container">
      {/* Target Format Selector Pills */}
      <div className="converter-toolbar">
        <div className="converter-pills">
          <span className="converter-pills-label">{t.converter?.targetFormat ?? 'Hedef Format:'}</span>
          {FORMAT_OPTIONS.map((fmt) => (
            <button
              key={fmt.id}
              className={`converter-pill ${targetFormat === fmt.id ? 'active' : ''}`}
              onClick={() => setTargetFormat(fmt.id)}
            >
              <span>{fmt.label}</span>
              <span className={`converter-pill-badge ${fmt.badge === 'Code' ? 'badge-code' : 'badge-data'}`}>
                {fmt.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="converter-actions">
          <button
            className="converter-btn"
            onClick={handleSwap}
            title={t.converter?.swap ?? 'Sonucu Giriş Yap (Swap)'}
            disabled={!output.trim()}
          >
            <ArrowLeftRight size={14} />
            <span>{t.converter?.swap ?? 'Takas Et'}</span>
          </button>

          <button
            className="converter-btn"
            onClick={handleLoadSample}
            title={t.converter?.loadSample ?? 'Örnek Yükle'}
          >
            <Wand2 size={14} />
            <span>{t.diff?.sample ?? 'Örnek'}</span>
          </button>

          <button
            className="converter-btn"
            onClick={handleCopy}
            disabled={!output.trim()}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{t.toolbar?.copy ?? 'Kopyala'}</span>
          </button>

          <button
            className="converter-btn converter-btn-primary"
            onClick={handleDownload}
            disabled={!output.trim()}
          >
            <Download size={14} />
            <span>{t.toolbar?.download ?? 'İndir'} (.{extension})</span>
          </button>
        </div>
      </div>

      {/* Dual Pane Editors */}
      <div className="converter-editors">
        {/* Left Input Pane */}
        <div className="converter-pane">
          <div className="converter-pane-header">
            <span className="converter-pane-title">Giriş (JSON / Kaynak)</span>
          </div>
          <div className="converter-editor-wrapper">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={inputContent}
              onChange={(val) => setInputContent(val || '')}
              onMount={handleInputMount}
              theme={currentThemeName}
              options={{
                fontSize: settings.fontSize,
                wordWrap: settings.wordWrap ? 'on' : 'off',
                lineNumbers: settings.lineNumbers ? 'on' : 'off',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
                wordSeparators: ' \t\r\n',
              }}
              loading={null}
            />
          </div>
        </div>

        {/* Right Output Pane */}
        <div className="converter-pane">
          <div className="converter-pane-header">
            <span className="converter-pane-title">
              Çıkış ({FORMAT_OPTIONS.find((f) => f.id === targetFormat)?.label})
            </span>
          </div>
          <div className="converter-editor-wrapper">
            <Editor
              height="100%"
              language={monacoLanguage}
              value={output}
              onMount={handleOutputMount}
              theme={currentThemeName}
              options={{
                fontSize: settings.fontSize,
                wordWrap: settings.wordWrap ? 'on' : 'off',
                lineNumbers: settings.lineNumbers ? 'on' : 'off',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: true,
                padding: { top: 12, bottom: 12 },
                fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
                wordSeparators: ' \t\r\n',
              }}
              loading={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
