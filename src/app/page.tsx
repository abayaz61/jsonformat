'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header, JsonEditor, JsonTree, ToastContainer, ExportModal } from '@/components';
import type { ToastType } from '@/components';
import { useSettings } from '@/contexts';
import { useJsonFormatter } from '@/hooks/useJsonFormatter';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { copyToClipboard, pasteFromClipboard } from '@/utils/clipboard';
import { downloadJson, readFile } from '@/utils/fileOperations';
import { useLanguage } from '@/contexts';
import { Code, GitBranch, ChevronsUpDown, ChevronsDownUp, ZoomIn } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ViewTab = 'editor' | 'tree';

export default function Home() {
  const { savedContent, setSavedContent } = useSettings();
  const { t } = useLanguage();
  const { content, setContent, validation, format, minify, clear } = useJsonFormatter(savedContent);
  const { isFullscreen, toggleFullscreen, fullscreenRef } = useFullscreen();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('editor');
  const [treeExpandKey, setTreeExpandKey] = useState<{ key: number; expand: boolean | null }>({ key: 0, expand: null });
  const [zoomLevel, setZoomLevel] = useLocalStorage('json-formatter-zoom', 100);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load saved content on mount
  useEffect(() => {
    if (isHydrated && savedContent) {
      setContent(savedContent);
    }
  }, [isHydrated, savedContent, setContent]);

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
    if (format()) {
      showToast(t.messages.formatted, 'success');
    } else {
      showToast(t.messages.invalidJson, 'error');
    }
  }, [format, showToast, t.messages.formatted, t.messages.invalidJson]);

  const handleMinify = useCallback(() => {
    if (minify()) {
      showToast(t.messages.minified, 'success');
    } else {
      showToast(t.messages.invalidJson, 'error');
    }
  }, [minify, showToast, t.messages.minified, t.messages.invalidJson]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(content);
    if (success) {
      showToast(t.messages.copied, 'success');
    }
  }, [content, showToast, t.messages.copied]);

  const handlePaste = useCallback(async () => {
    const text = await pasteFromClipboard();
    if (text !== null) {
      setContent(text);
    } else {
      showToast(t.messages.pasteError, 'error');
    }
  }, [setContent, showToast, t.messages.pasteError]);

  const handleDownload = useCallback(() => {
    if (content.trim()) {
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadJson(content, `json-${timestamp}.json`);
      showToast(t.messages.downloaded, 'success');
    }
  }, [content, showToast, t.messages.downloaded]);

  const handleUpload = useCallback(async (file: File) => {
    try {
      const text = await readFile(file);
      setContent(text);
    } catch {
      showToast(t.messages.uploadError, 'error');
    }
  }, [setContent, showToast, t.messages.uploadError]);

  const handleClear = useCallback(() => {
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
        disabled={!content.trim()}
      />

      <main className="main-content">

        {/* Tab Bar */}
        <div className="tab-bar">
          <button
            className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <Code size={14} />
            <span>Editor</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'tree' ? 'active' : ''}`}
            onClick={() => setActiveTab('tree')}
          >
            <GitBranch size={14} />
            <span>Tree</span>
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
                title={`Zoom: ${zoomLevel}%`}
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
          ) : (
            <JsonTree
              data={content}
              expandAll={treeExpandKey.expand}
              treeKey={treeExpandKey.key}
            />
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

