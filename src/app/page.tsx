'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header, JsonEditor, JsonTree, JsonQuery, JsonDiff, JsonConverter, ToastContainer, ExportModal } from '@/components';
import type { ToastType } from '@/components';
import { useSettings } from '@/contexts';
import { useJsonFormatter } from '@/hooks/useJsonFormatter';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { copyToClipboard, pasteFromClipboard } from '@/utils/clipboard';
import { downloadJson, readFile } from '@/utils/fileOperations';
import { getInitialSessionContent } from '@/utils/sessionState';
import { useLanguage } from '@/contexts';
import { trackEvent } from '@/lib/gtag';
import { Code, GitBranch, ChevronsUpDown, ChevronsDownUp, ZoomIn, Terminal, GitCompare, RefreshCw } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ViewTab = 'editor' | 'tree' | 'query' | 'diff' | 'converter';

export default function Home() {
  const isHydrated = React.useSyncExternalStore(() => () => {}, () => true, () => false);
  const initialContent = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return getInitialSessionContent(window.sessionStorage, window.localStorage);
  }, []);
  const { setSavedContent } = useSettings();
  const { t } = useLanguage();
  const { content, setContent, validation, format, minify, clear } = useJsonFormatter(initialContent);
  const { isFullscreen, toggleFullscreen, fullscreenRef } = useFullscreen();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>('editor');
  const [treeExpandKey, setTreeExpandKey] = useState<{ key: number; expand: boolean | null }>({ key: 0, expand: null });
  const [zoomLevel, setZoomLevel] = useLocalStorage('json-formatter-zoom', 100);
  const [autoFormat, setAutoFormat] = useLocalStorage('json-formatter-auto-format', false);
  const [ignoreNull, setIgnoreNull] = useLocalStorage('json-formatter-ignore-null', false);
  const [ignoreDefaultDates, setIgnoreDefaultDates] = useLocalStorage('json-formatter-ignore-dates', false);
  const [ignoreZeros, setIgnoreZeros] = useLocalStorage('json-formatter-ignore-zeros', false);
  const [convertDotNetDates, setConvertDotNetDates] = useLocalStorage('json-formatter-convert-dotnet-dates', false);
  const [ignoreEmptyArrays, setIgnoreEmptyArrays] = useLocalStorage('json-formatter-ignore-empty-arrays', false);
  const [trim, setTrim] = useLocalStorage('json-formatter-trim', false);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevContentRef = useRef<string>(content);

  const filterOptions = React.useMemo(
    () => ({ ignoreNull, ignoreDefaultDates, ignoreZeros, ignoreEmptyArrays, convertDotNetDates, trim }),
    [ignoreNull, ignoreDefaultDates, ignoreZeros, ignoreEmptyArrays, convertDotNetDates, trim]
  );

  // Auto-format on paste: detect large content changes (paste event)
  useEffect(() => {
    if (autoFormat && isHydrated && content && content !== prevContentRef.current) {
      const prevLen = prevContentRef.current.length;
      const newLen = content.length;
      // Detect paste or content replacement (length changed by more than 1 char)
      if (Math.abs(newLen - prevLen) > 1) {
        // Delay slightly for state to settle
        const timer = setTimeout(() => format(2, filterOptions), 50);
        prevContentRef.current = content;
        return () => clearTimeout(timer);
      }
    }
    prevContentRef.current = content;
  }, [content, autoFormat, isHydrated, format, filterOptions]);

  // Save content on change
  useEffect(() => {
    if (isHydrated) {
      setSavedContent(content);
    }
  }, [content, isHydrated, setSavedContent]);

  // Set fullscreen ref
  useEffect(() => {
    if (containerRef.current) {
      fullscreenRef.current = containerRef.current;
    }
  }, [fullscreenRef]);

  // Toast helpers
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Handlers with useCallback
  const handleFormat = useCallback(() => {
    trackEvent('format_json', { category: 'editor' });
    const result = format(2, filterOptions);
    if (result === 'full') {
      showToast(t.messages.formatted, 'success');
    } else if (result === 'partial') {
      showToast(t.messages.partialFormatted, 'warning');
    } else {
      showToast(t.messages.invalidJson, 'error');
    }
  }, [format, filterOptions, showToast, t.messages.formatted, t.messages.partialFormatted, t.messages.invalidJson]);

  const handleMinify = useCallback(() => {
    trackEvent('minify_json', { category: 'editor' });
    if (minify()) {
      showToast(t.messages.minified, 'success');
    } else {
      showToast(t.messages.invalidJson, 'error');
    }
  }, [minify, showToast, t.messages.minified, t.messages.invalidJson]);

  const handleCopy = useCallback(async () => {
    trackEvent('copy_json', { category: 'editor' });
    const success = await copyToClipboard(content);
    if (success) {
      showToast(t.messages.copied, 'success');
    }
  }, [content, showToast, t.messages.copied]);

  const handlePaste = useCallback(async () => {
    trackEvent('paste_json', { category: 'editor' });
    const text = await pasteFromClipboard();
    if (text !== null) {
      setContent(text);
    } else {
      showToast(t.messages.pasteError, 'error');
    }
  }, [setContent, showToast, t.messages.pasteError]);

  const handleDownload = useCallback(() => {
    trackEvent('download_json', { category: 'file' });
    if (content.trim()) {
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadJson(content, `json-${timestamp}.json`);
      showToast(t.messages.downloaded, 'success');
    }
  }, [content, showToast, t.messages.downloaded]);

  const handleUpload = useCallback(async (file: File) => {
    trackEvent('upload_json', { category: 'file' });
    try {
      const text = await readFile(file);
      setContent(text);
    } catch {
      showToast(t.messages.uploadError, 'error');
    }
  }, [setContent, showToast, t.messages.uploadError]);

  const handleClear = useCallback(() => {
    trackEvent('clear_json', { category: 'editor' });
    clear();
    showToast(t.messages.cleared, 'info');
  }, [clear, showToast, t.messages.cleared]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input/textarea that should handle its own shortcuts
      const target = e.target as HTMLElement;
      const isEditorFocused = target.closest('.monaco-editor');

      // Ctrl+Shift+F - Format
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        handleFormat();
        return;
      }

      // Ctrl+Shift+M - Minify
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        handleMinify();
        return;
      }

      // Ctrl+S - Save/Download (prevent browser save dialog)
      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault();
        handleDownload();
        return;
      }

      // Ctrl+Shift+C - Copy all
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleCopy();
        return;
      }

      // Ctrl+Shift+X - Clear
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        handleClear();
        return;
      }

      // F11 - Fullscreen (only when not in editor)
      if (e.key === 'F11' && !isEditorFocused) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Escape - Exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Tab switching: Ctrl+1 for Editor, Ctrl+2 for Tree
      if (e.ctrlKey && !e.shiftKey && e.key === '1') {
        e.preventDefault();
        setActiveTab('editor');
        return;
      }
      if (e.ctrlKey && !e.shiftKey && e.key === '2') {
        e.preventDefault();
        setActiveTab('tree');
        return;
      }
      if (e.ctrlKey && !e.shiftKey && e.key === '3') {
        e.preventDefault();
        setActiveTab('query');
        return;
      }
      if (e.ctrlKey && !e.shiftKey && e.key === '4') {
        e.preventDefault();
        setActiveTab('diff');
        return;
      }
      if (e.ctrlKey && !e.shiftKey && e.key === '5') {
        e.preventDefault();
        setActiveTab('converter');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFormat, handleMinify, handleDownload, handleCopy, handleClear, isFullscreen, toggleFullscreen]);

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="app-container">
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="app-container">
      <Header
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onDownload={handleDownload}
        onUpload={handleUpload}
        onClear={handleClear}
        onExport={() => setShowExportModal(true)}
        formatOptions={{ autoFormat, ...filterOptions }}
        onToggleFormatOption={(key: string) => {
          switch (key) {
            case 'autoFormat': setAutoFormat(!autoFormat); break;
            case 'ignoreNull': setIgnoreNull(!ignoreNull); break;
            case 'ignoreDefaultDates': setIgnoreDefaultDates(!ignoreDefaultDates); break;
            case 'ignoreZeros': setIgnoreZeros(!ignoreZeros); break;
            case 'ignoreEmptyArrays': setIgnoreEmptyArrays(!ignoreEmptyArrays); break;
            case 'convertDotNetDates': setConvertDotNetDates(!convertDotNetDates); break;
            case 'trim': setTrim(!trim); break;
          }
        }}
        disabled={!content.trim()}
      />

      <main className="main-content">

        {/* Tab Bar */}
        <div className="tab-bar">
          <button
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('editor');
              trackEvent('select_tab', { category: 'navigation', label: 'editor' });
            }}
          >
            <Code size={14} />
            <span>{t.editor.tabEditor}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'tree' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tree');
              trackEvent('select_tab', { category: 'navigation', label: 'tree' });
            }}
          >
            <GitBranch size={14} />
            <span>{t.editor.tabTree}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'query' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('query');
              trackEvent('select_tab', { category: 'navigation', label: 'query' });
            }}
          >
            <Terminal size={14} />
            <span>{t.query.tabQuery}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('diff');
              trackEvent('select_tab', { category: 'navigation', label: 'diff' });
            }}
          >
            <GitCompare size={14} />
            <span>{t.editor.tabDiff ?? 'Diff'}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'converter' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('converter');
              trackEvent('select_tab', { category: 'navigation', label: 'converter' });
            }}
          >
            <RefreshCw size={14} />
            <span>{t.editor.tabConverter ?? 'Dönüştürücü'}</span>
          </button>

          {/* Right side controls */}
          <div className="tab-bar-right">
            {/* Tree Controls - only visible when tree tab is active */}
            {activeTab === 'tree' && (
              <>
                <button
                  className="tab-action-button"
                  onClick={() => setTreeExpandKey(k => ({ key: k.key + 1, expand: true }))}
                  title="Expand All"
                >
                  <ChevronsUpDown size={16} />
                </button>
                <button
                  className="tab-action-button"
                  onClick={() => setTreeExpandKey(k => ({ key: k.key + 1, expand: false }))}
                  title="Collapse All"
                >
                  <ChevronsDownUp size={16} />
                </button>
                <div className="tab-bar-separator" />
              </>
            )}

            {/* Zoom Control - always visible */}
            <div className="tab-bar-zoom">
              <button
                className="tab-action-button"
                onClick={() => setShowZoomPopup(!showZoomPopup)}
                title={`${t.editor.zoom}: ${zoomLevel}%`}
              >
                <ZoomIn size={16} />
              </button>
              {showZoomPopup && (
                <>
                  <div className="zoom-backdrop" onClick={() => setShowZoomPopup(false)} />
                  <div className="zoom-popup">
                    <span className="zoom-value">{zoomLevel}%</span>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="10"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(Number(e.target.value))}
                      className="zoom-slider"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="content-panels"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoomLevel}%`,
            height: `${10000 / zoomLevel}%`
          }}
        >
          {activeTab === 'editor' ? (
            <JsonEditor
              value={content}
              onChange={setContent}
              validation={validation}
            />
          ) : activeTab === 'tree' ? (
            <JsonTree
              data={content}
              expandAll={treeExpandKey.expand}
              treeKey={treeExpandKey.key}
            />
          ) : activeTab === 'query' ? (
            <JsonQuery data={content} />
          ) : activeTab === 'diff' ? (
            <JsonDiff initialContent={content} />
          ) : (
            <JsonConverter initialContent={content} />
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        jsonData={content}
      />
    </div>
  );
}
