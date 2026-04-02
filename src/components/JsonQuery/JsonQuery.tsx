'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Table2,
  Braces,
  AlertCircle,
  Clock,
  Rows3,
  ChevronDown,
  Database,
  History,
  X,
  Trash2,
} from 'lucide-react';
import { runQuery, EXAMPLE_QUERIES, type QueryResult } from './QueryEngine';
import { ResultTable } from './ResultTable';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/contexts';
import { defineMonacoTheme } from '@/utils/monacoTheme';

interface JsonQueryProps {
  data: string;
}

type ViewMode = 'table' | 'raw';

export interface HistoryEntry {
  id: string;
  sql: string;
  rowCount: number;
  executionTime: number;
  timestamp: number;
}

const MAX_HISTORY = 20;
const LS_SQL_KEY = 'json-query-last-sql';
const LS_HISTORY_KEY = 'json-query-history';
const LS_VIEWMODE_KEY = 'json-query-view-mode';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function JsonQuery({ data }: JsonQueryProps) {
  const { theme } = useTheme();

  const [sql, setSql] = useLocalStorage<string>(LS_SQL_KEY, 'SELECT * FROM ?');
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(LS_HISTORY_KEY, []);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(LS_VIEWMODE_KEY, 'table');

  const [result, setResult] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Monaco refs
  const sqlMonacoRef = useRef<Monaco | null>(null);
  const sqlEditorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [monacoThemeName, setMonacoThemeName] = useState('vs-dark');

  const examplesRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Track JSON data changes → clear stale results
  const dataHashRef = useRef<string>(data);
  useEffect(() => {
    if (data !== dataHashRef.current) {
      dataHashRef.current = data;
      setResult(null);
    }
  }, [data]);

  // Keep Monaco theme in sync with app theme
  useEffect(() => {
    if (sqlMonacoRef.current) {
      const name = defineMonacoTheme(sqlMonacoRef.current, theme.color, theme.mode);
      sqlMonacoRef.current.editor.setTheme(name);
      setMonacoThemeName(name);
    }
  }, [theme.color, theme.mode]);

  // SQL editor mount handler
  const handleSqlEditorMount: OnMount = (editor, monaco) => {
    sqlMonacoRef.current = monaco;
    sqlEditorRef.current = editor;

    // Apply theme
    const name = defineMonacoTheme(monaco, theme.color, theme.mode);
    monaco.editor.setTheme(name);
    setMonacoThemeName(name);

    // Ctrl+Enter to run inside Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunRef.current?.();
    });
  };

  // Parse JSON data
  const parsedData = useMemo(() => {
    if (!data.trim()) return null;
    try { return JSON.parse(data); }
    catch { return null; }
  }, [data]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (examplesRef.current && !examplesRef.current.contains(e.target as Node)) setShowExamples(false);
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) setShowHistory(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Stable ref for handleRun so Monaco command closure can call it
  const handleRunRef = useRef<(() => void) | null>(null);

  const addToHistory = useCallback((querySql: string, res: QueryResult) => {
    if (res.error) return;
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      sql: querySql.trim(),
      rowCount: res.rowCount,
      executionTime: res.executionTime,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const deduped = prev.filter((h) => h.sql !== entry.sql);
      return [entry, ...deduped].slice(0, MAX_HISTORY);
    });
  }, [setHistory]);

  const handleRun = useCallback(async () => {
    const currentSql = sqlEditorRef.current?.getValue() ?? sql;
    if (!currentSql.trim() || !parsedData) return;
    setIsRunning(true);
    try {
      const res = await runQuery(currentSql.trim(), parsedData);
      setResult(res);
      addToHistory(currentSql, res);
    } finally {
      setIsRunning(false);
    }
  }, [sql, parsedData, addToHistory]);

  // Keep ref in sync
  useEffect(() => { handleRunRef.current = handleRun; }, [handleRun]);

  const handleCopyResult = useCallback(async () => {
    if (!result) return;
    const text = JSON.stringify(result.data, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleDownloadResult = useCallback(() => {
    if (!result) return;
    const text = JSON.stringify(result.data, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'query-result.json'; a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleReset = () => { setSql('SELECT * FROM ?'); setResult(null); };

  const selectQuery = (querySql: string) => {
    setSql(querySql);
    // Also update Monaco editor value directly
    sqlEditorRef.current?.setValue(querySql);
    setShowExamples(false);
    setShowHistory(false);
    sqlEditorRef.current?.focus();
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const clearHistory = () => { setHistory([]); setShowHistory(false); };

  // Raw JSON string for result viewer
  const rawJson = useMemo(() =>
    result && !result.error ? JSON.stringify(result.data, null, 2) : '',
    [result]
  );

  const isEmpty = !data.trim();
  const isInvalidJson = !isEmpty && parsedData === null;
  const canRun = !isEmpty && !isInvalidJson && sql.trim().length > 0;

  return (
    <div className="query-container">
      {/* Query Input Panel */}
      <div className="query-input-panel">
        {/* Panel Header */}
        <div className="query-panel-header">
          <div className="query-panel-title">
            <Database size={14} />
            <span>SQL Query</span>
          </div>
          <div className="query-panel-actions">

            {/* History Dropdown */}
            <div className="query-examples-dropdown" ref={historyRef}>
              <button
                className="query-btn query-btn-secondary"
                onClick={() => { setShowHistory(!showHistory); setShowExamples(false); }}
                title="Query history"
              >
                <History size={13} />
                <span>History</span>
                {history.length > 0 && (
                  <span className="query-history-badge">{history.length}</span>
                )}
              </button>
              {showHistory && (
                <div className="query-examples-menu query-history-menu">
                  <div className="query-history-header">
                    <span className="query-examples-title">Query History</span>
                    {history.length > 0 && (
                      <button className="query-history-clear-btn" onClick={clearHistory} title="Clear all history">
                        <Trash2 size={11} /> Clear
                      </button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <div className="query-history-empty">No history yet — run a query to start</div>
                  ) : (
                    history.map((entry) => (
                      <button key={entry.id} className="query-example-item query-history-item" onClick={() => selectQuery(entry.sql)}>
                        <div className="query-history-item-header">
                          <span className="query-history-meta"><Rows3 size={10} />{entry.rowCount} rows</span>
                          <span className="query-history-meta"><Clock size={10} />{entry.executionTime}ms</span>
                          <span className="query-history-time">{timeAgo(entry.timestamp)}</span>
                          <span
                            className="query-history-delete"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => deleteHistoryEntry(entry.id, e)}
                            onKeyDown={(e) => e.key === 'Enter' && deleteHistoryEntry(entry.id, e as unknown as React.MouseEvent)}
                            title="Remove"
                          ><X size={10} /></span>
                        </div>
                        <code className="query-example-sql">{entry.sql}</code>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Examples Dropdown */}
            <div className="query-examples-dropdown" ref={examplesRef}>
              <button
                className="query-btn query-btn-secondary"
                onClick={() => { setShowExamples(!showExamples); setShowHistory(false); }}
                title="Example queries"
              >
                <span>Examples</span>
                <ChevronDown size={12} />
              </button>
              {showExamples && (
                <div className="query-examples-menu">
                  <div className="query-examples-title">Example Queries</div>
                  {EXAMPLE_QUERIES.map((ex) => (
                    <button key={ex.label} className="query-example-item" onClick={() => selectQuery(ex.sql)}>
                      <span className="query-example-label">{ex.label}</span>
                      <code className="query-example-sql">{ex.sql}</code>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="query-btn query-btn-ghost" onClick={handleReset} title="Reset">
              <RotateCcw size={13} />
            </button>

            <button
              className="query-btn query-btn-primary"
              onClick={handleRun}
              disabled={!canRun || isRunning}
              title="Run query (Ctrl+Enter)"
            >
              <Play size={13} />
              <span>{isRunning ? 'Running…' : 'Run'}</span>
            </button>
          </div>
        </div>

        {/* Monaco SQL Editor */}
        <div className="query-monaco-editor-wrapper">
          <Editor
            height="120px"
            language="sql"
            value={sql}
            onChange={(val) => setSql(val ?? '')}
            onMount={handleSqlEditorMount}
            theme={monacoThemeName}
            options={{
              fontSize: 13,
              fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
              fontLigatures: true,
              lineNumbers: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              padding: { top: 10, bottom: 10 },
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              folding: false,
              lineDecorationsWidth: 8,
              overviewRulerLanes: 0,
              scrollbar: { vertical: 'hidden', horizontal: 'hidden', alwaysConsumeMouseWheel: false },
              suggest: { showKeywords: true },
            }}
            loading={null}
          />
        </div>

        {/* Hint */}
        <div className="query-hint">
          <span>Use <code>?</code> to reference your JSON data • <kbd>Ctrl+Enter</kbd> to run</span>
        </div>

        {/* Status Banners */}
        {isEmpty && (
          <div className="query-status-banner query-status-warning">
            <AlertCircle size={13} />
            <span>No JSON data loaded. Paste or type JSON in the Editor tab first.</span>
          </div>
        )}
        {isInvalidJson && (
          <div className="query-status-banner query-status-error">
            <AlertCircle size={13} />
            <span>Invalid JSON — fix errors in the Editor tab to run queries.</span>
          </div>
        )}
      </div>

      {/* Results Panel */}
      {result && (
        <div className="query-results-panel">
          {/* Results Toolbar */}
          <div className="query-results-toolbar">
            <div className="query-results-meta">
              {result.error ? (
                <span className="query-meta-error"><AlertCircle size={13} />Query Error</span>
              ) : (
                <>
                  <span className="query-meta-stat"><Rows3 size={13} />{result.rowCount.toLocaleString()} row{result.rowCount !== 1 ? 's' : ''}</span>
                  <span className="query-meta-sep" />
                  <span className="query-meta-stat"><Clock size={13} />{result.executionTime}ms</span>
                </>
              )}
            </div>

            {!result.error && (
              <div className="query-results-actions">
                <div className="query-view-toggle">
                  <button className={`query-view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="Table view">
                    <Table2 size={13} /><span>Table</span>
                  </button>
                  <button className={`query-view-btn ${viewMode === 'raw' ? 'active' : ''}`} onClick={() => setViewMode('raw')} title="Raw JSON view">
                    <Braces size={13} /><span>Raw</span>
                  </button>
                </div>
                <span className="query-meta-sep" />
                <button className="query-btn query-btn-ghost" onClick={handleCopyResult} title="Copy result as JSON">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button className="query-btn query-btn-ghost" onClick={handleDownloadResult} title="Download result as JSON">
                  <Download size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Result Content */}
          <div className="query-result-content">
            {result.error ? (
              <div className="query-error-panel">
                <div className="query-error-icon"><AlertCircle size={18} /></div>
                <div className="query-error-body">
                  <div className="query-error-title">Query Failed</div>
                  <pre className="query-error-message">{result.error}</pre>
                  <div className="query-error-tip">
                    💡 Make sure you use <code>?</code> as the table name. Example: <code>SELECT * FROM ?</code>
                  </div>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <ResultTable data={result.data} columns={result.columns} />
            ) : (
              /* Monaco read-only JSON viewer — same look as the main editor */
              <div className="query-raw-monaco-wrapper">
                <Editor
                  height="100%"
                  language="json"
                  value={rawJson}
                  theme={monacoThemeName}
                  options={{
                    readOnly: true,
                    fontSize: 13,
                    fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
                    fontLigatures: true,
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'off',
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'line',
                    smoothScrolling: true,
                    folding: true,
                    cursorStyle: 'line',
                    domReadOnly: true,
                    contextmenu: false,
                  }}
                  loading={null}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && canRun && (
        <div className="query-empty-state">
          <div className="query-empty-icon"><Database size={32} /></div>
          <div className="query-empty-title">Ready to Query</div>
          <div className="query-empty-desc">
            Write a SQL query above and press <kbd>Run</kbd> or <kbd>Ctrl+Enter</kbd>
          </div>
        </div>
      )}
    </div>
  );
}
