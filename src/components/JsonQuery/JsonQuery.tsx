'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * Lightweight SQL beautifier — keeps column lists inline,
 * only breaks on major SQL clauses.
 */
function beautifySql(raw: string): string {
  // Collapse whitespace
  let sql = raw.replace(/\s+/g, ' ').trim();

  // Uppercase keywords — only whole words
  const keywords = [
    'SELECT','DISTINCT','FROM','WHERE','AND','OR','NOT','IN','IS','NULL',
    'LIKE','BETWEEN','EXISTS','CASE','WHEN','THEN','ELSE','END',
    'ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET','UNION ALL','UNION',
    'INTERSECT','EXCEPT','LEFT JOIN','RIGHT JOIN','INNER JOIN','FULL JOIN',
    'CROSS JOIN','JOIN','ON','AS','ASC','DESC','INSERT INTO','VALUES',
    'UPDATE','SET','DELETE FROM','CREATE TABLE','DROP TABLE','ALTER TABLE',
    'COUNT','SUM','AVG','MIN','MAX','COALESCE','CAST','OVER','PARTITION BY',
  ];
  // Sort longest first to avoid partial replacement
  keywords.sort((a, b) => b.length - a.length);
  for (const kw of keywords) {
    sql = sql.replace(new RegExp(`(?<!['"])\\b${kw}\\b(?!['"])`, 'gi'), kw);
  }

  // Break before major clauses
  const breaks = ['FROM','WHERE','AND','OR','ORDER BY','GROUP BY','HAVING','LIMIT','OFFSET',
                   'LEFT JOIN','RIGHT JOIN','INNER JOIN','FULL JOIN','CROSS JOIN','JOIN',
                   'UNION ALL','UNION','INTERSECT','EXCEPT'];
  for (const clause of breaks) {
    sql = sql.replace(new RegExp(`\\s+(?=${clause}\\b)`, 'gi'), '\n');
  }

  // Indent continuation lines (AND / OR get extra indent)
  const lines = sql.split('\n').map((line, i) => {
    if (i === 0) return line;
    const trimmed = line.trim();
    if (/^(AND|OR)\b/i.test(trimmed)) return '  ' + trimmed;
    return trimmed;
  });

  return lines.join('\n');
}
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Copy,
  Wand2,
  GripVertical,
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
import { useTheme, useLanguage } from '@/contexts';
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
  const { t } = useLanguage();

  const [sql, setSql] = useLocalStorage<string>(LS_SQL_KEY, 'SELECT * FROM ?');
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(LS_HISTORY_KEY, []);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(LS_VIEWMODE_KEY, 'table');

  const [result, setResult] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Resizable SQL editor panel
  const MIN_EDITOR_H = 80;
  const MAX_EDITOR_H = 400;
  const [editorHeight, setEditorHeight] = useState(120);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartHRef = useRef(0);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartHRef.current = editorHeight;

    const onMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = ev.clientY - dragStartYRef.current;
      const next = Math.min(MAX_EDITOR_H, Math.max(MIN_EDITOR_H, dragStartHRef.current + delta));
      setEditorHeight(next);
    };
    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [editorHeight]);

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

  // Format the SQL query in the editor
  const handleFormatSql = useCallback(() => {
    const raw = sqlEditorRef.current?.getValue() ?? sql;
    if (!raw.trim()) return;
    try {
      const formatted = beautifySql(raw);
      sqlEditorRef.current?.setValue(formatted);
      setSql(formatted);
    } catch {
      // silently ignore
    }
  }, [sql, setSql]);

  const handleFormatRef = useRef<(() => void) | null>(null);
  useEffect(() => { handleFormatRef.current = handleFormatSql; }, [handleFormatSql]);

  // SQL editor mount handler
  const handleSqlEditorMount: OnMount = (editor, monaco) => {
    sqlMonacoRef.current = monaco;
    sqlEditorRef.current = editor;

    const name = defineMonacoTheme(monaco, theme.color, theme.mode);
    monaco.editor.setTheme(name);
    setMonacoThemeName(name);

    // Ctrl+Enter → run query
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunRef.current?.();
    });
    // Shift+Alt+F → format SQL
    editor.addCommand(
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => { handleFormatRef.current?.(); }
    );
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
    let currentSql = sqlEditorRef.current?.getValue() ?? sql;
    
    if (sqlEditorRef.current) {
      const selection = sqlEditorRef.current.getSelection();
      if (selection && !selection.isEmpty()) {
        const model = sqlEditorRef.current.getModel();
        if (model) {
          const selectedText = model.getValueInRange(selection);
          if (selectedText.trim()) {
            currentSql = selectedText;
          }
        }
      }
    }

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

  const rawJson = useMemo(() =>
    result && !result.error ? JSON.stringify(result.data, null, 2) : '',
    [result]
  );

  const isEmpty = !data.trim();
  const isInvalidJson = !isEmpty && parsedData === null;
  const canRun = !isEmpty && !isInvalidJson && sql.trim().length > 0;

  // Row count label
  const rowLabel = (count: number) => count === 1 ? t.query.row : t.query.rows;

  return (
    <div className="query-container">
      {/* Query Input Panel */}
      <div className="query-input-panel">
        <div className="query-panel-header">
          <div className="query-panel-title">
            <Database size={14} />
            <span>{t.query.panelTitle}</span>
          </div>
          <div className="query-panel-actions">

            {/* Format Button */}
            <button
              className="query-btn query-btn-secondary"
              onClick={handleFormatSql}
              title="Format SQL (Shift+Alt+F)"
            >
              <Wand2 size={13} />
              <span>Format</span>
            </button>

            {/* History Dropdown */}
            <div className="query-examples-dropdown" ref={historyRef}>
              <button
                className="query-btn query-btn-secondary"
                onClick={() => { setShowHistory(!showHistory); setShowExamples(false); }}
                title={t.query.history}
              >
                <History size={13} />
                <span>{t.query.history}</span>
                {history.length > 0 && (
                  <span className="query-history-badge">{history.length}</span>
                )}
              </button>
              {showHistory && (
                <div className="query-examples-menu query-history-menu">
                  <div className="query-history-header">
                    <span className="query-examples-title">{t.query.historyTitle}</span>
                    {history.length > 0 && (
                      <button className="query-history-clear-btn" onClick={clearHistory} title={t.query.clearHistory}>
                        <Trash2 size={11} /> {t.query.clearHistory}
                      </button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <div className="query-history-empty">{t.query.noHistory}</div>
                  ) : (
                    history.map((entry) => (
                      <button key={entry.id} className="query-example-item query-history-item" onClick={() => selectQuery(entry.sql)}>
                        <div className="query-history-item-header">
                          <span className="query-history-meta"><Rows3 size={10} />{entry.rowCount} {rowLabel(entry.rowCount)}</span>
                          <span className="query-history-meta"><Clock size={10} />{entry.executionTime}ms</span>
                          <span className="query-history-time">{timeAgo(entry.timestamp)}</span>
                          <span
                            className="query-history-delete"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => deleteHistoryEntry(entry.id, e)}
                            onKeyDown={(e) => e.key === 'Enter' && deleteHistoryEntry(entry.id, e as unknown as React.MouseEvent)}
                            title={t.query.remove}
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
                title={t.query.examples}
              >
                <span>{t.query.examples}</span>
                <ChevronDown size={12} />
              </button>
              {showExamples && (
                <div className="query-examples-menu">
                  <div className="query-examples-title">{t.query.examplesTitle}</div>
                  {EXAMPLE_QUERIES.map((ex) => (
                    <button key={ex.label} className="query-example-item" onClick={() => selectQuery(ex.sql)}>
                      <span className="query-example-label">{ex.label}</span>
                      <code className="query-example-sql">{ex.sql}</code>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="query-btn query-btn-ghost" onClick={handleReset} title={t.query.reset}>
              <RotateCcw size={13} />
            </button>

            <button
              className="query-btn query-btn-primary"
              onClick={handleRun}
              disabled={!canRun || isRunning}
              title={`${t.query.run} (Ctrl+Enter)`}
            >
              <Play size={13} />
              <span>{isRunning ? t.query.running : t.query.run}</span>
            </button>
          </div>
        </div>

        {/* Monaco SQL Editor + resize handle */}
        <div className="query-monaco-editor-wrapper" style={{ height: editorHeight }}>
          <Editor
            height="100%"
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

        {/* Drag handle to resize the editor */}
        <div
          className="query-editor-resize-handle"
          onMouseDown={handleDragStart}
          title="Drag to resize"
        >
          <GripVertical size={14} />
        </div>

        {/* Hint */}
        <div className="query-hint">
          <span>
            {t.query.hint.split('Ctrl+Enter').map((part, i, arr) =>
              i < arr.length - 1
                ? <React.Fragment key={i}>{part}<kbd>Ctrl+Enter</kbd></React.Fragment>
                : <React.Fragment key={i}>{part}</React.Fragment>
            )}
            {' · '}<kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>F</kbd> Format
          </span>
        </div>

        {/* Status Banners */}
        {isEmpty && (
          <div className="query-status-banner query-status-warning">
            <AlertCircle size={13} />
            <span>{t.query.noJsonData}</span>
          </div>
        )}
        {isInvalidJson && (
          <div className="query-status-banner query-status-error">
            <AlertCircle size={13} />
            <span>{t.query.invalidJson}</span>
          </div>
        )}
      </div>

      {/* Results Panel */}
      {result && (
        <div className="query-results-panel">
          <div className="query-results-toolbar">
            <div className="query-results-meta">
              {result.error ? (
                <span className="query-meta-error"><AlertCircle size={13} />{t.query.errorTitle}</span>
              ) : (
                <>
                  <span className="query-meta-stat"><Rows3 size={13} />{result.rowCount.toLocaleString()} {rowLabel(result.rowCount)}</span>
                  <span className="query-meta-sep" />
                  <span className="query-meta-stat"><Clock size={13} />{result.executionTime}ms</span>
                </>
              )}
            </div>

            {!result.error && (
              <div className="query-results-actions">
                <div className="query-view-toggle">
                  <button className={`query-view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title={t.query.tableView}>
                    <Table2 size={13} /><span>{t.query.tableView}</span>
                  </button>
                  <button className={`query-view-btn ${viewMode === 'raw' ? 'active' : ''}`} onClick={() => setViewMode('raw')} title={t.query.rawView}>
                    <Braces size={13} /><span>{t.query.rawView}</span>
                  </button>
                </div>
                <span className="query-meta-sep" />
                <button className="query-btn query-btn-ghost" onClick={handleCopyResult} title={t.query.copyResult}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button className="query-btn query-btn-ghost" onClick={handleDownloadResult} title={t.query.downloadResult}>
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
                  <div className="query-error-title">{t.query.errorTitle}</div>
                  <pre className="query-error-message">{result.error}</pre>
                  <div className="query-error-tip">{t.query.errorTip}</div>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <ResultTable data={result.data} columns={result.columns} />
            ) : (
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
          <div className="query-empty-title">{t.query.readyTitle}</div>
          <div className="query-empty-desc">{t.query.readyDesc}</div>
        </div>
      )}
    </div>
  );
}
