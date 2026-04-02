'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  const [sql, setSql] = useLocalStorage<string>(LS_SQL_KEY, 'SELECT * FROM ?');
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(LS_HISTORY_KEY, []);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(LS_VIEWMODE_KEY, 'table');

  const [result, setResult] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Track last data hash to detect JSON changes and clear stale results
  const dataHashRef = useRef<string>(data);
  useEffect(() => {
    if (data !== dataHashRef.current) {
      dataHashRef.current = data;
      setResult(null); // clear stale results when source JSON changes
    }
  }, [data]);

  // Parse JSON data
  const parsedData = useMemo(() => {
    if (!data.trim()) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (examplesRef.current && !examplesRef.current.contains(e.target as Node)) {
        setShowExamples(false);
      }
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addToHistory = useCallback(
    (querySql: string, res: QueryResult) => {
      if (res.error) return; // only cache successful queries
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        sql: querySql.trim(),
        rowCount: res.rowCount,
        executionTime: res.executionTime,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        // Deduplicate: remove identical sql already in history
        const deduped = prev.filter((h) => h.sql !== entry.sql);
        // Prepend and cap at MAX_HISTORY
        return [entry, ...deduped].slice(0, MAX_HISTORY);
      });
    },
    [setHistory]
  );

  const handleRun = useCallback(async () => {
    if (!sql.trim() || !parsedData) return;
    setIsRunning(true);
    try {
      const res = await runQuery(sql.trim(), parsedData);
      setResult(res);
      addToHistory(sql, res);
    } finally {
      setIsRunning(false);
    }
  }, [sql, parsedData, addToHistory]);

  // Ctrl+Enter to run
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

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
    a.href = url;
    a.download = 'query-result.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleReset = () => {
    setSql('SELECT * FROM ?');
    setResult(null);
  };

  const selectQuery = (querySql: string) => {
    setSql(querySql);
    setShowExamples(false);
    setShowHistory(false);
    textareaRef.current?.focus();
  };

  const deleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    setShowHistory(false);
  };

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
                      <button
                        className="query-history-clear-btn"
                        onClick={clearHistory}
                        title="Clear all history"
                      >
                        <Trash2 size={11} />
                        Clear
                      </button>
                    )}
                  </div>
                  {history.length === 0 ? (
                    <div className="query-history-empty">No history yet — run a query to start</div>
                  ) : (
                    history.map((entry) => (
                      <button
                        key={entry.id}
                        className="query-example-item query-history-item"
                        onClick={() => selectQuery(entry.sql)}
                      >
                        <div className="query-history-item-header">
                          <span className="query-history-meta">
                            <Rows3 size={10} />
                            {entry.rowCount} rows
                          </span>
                          <span className="query-history-meta">
                            <Clock size={10} />
                            {entry.executionTime}ms
                          </span>
                          <span className="query-history-time">{timeAgo(entry.timestamp)}</span>
                          <button
                            className="query-history-delete"
                            onClick={(e) => deleteHistoryEntry(entry.id, e)}
                            title="Remove from history"
                          >
                            <X size={10} />
                          </button>
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
                    <button
                      key={ex.label}
                      className="query-example-item"
                      onClick={() => selectQuery(ex.sql)}
                    >
                      <span className="query-example-label">{ex.label}</span>
                      <code className="query-example-sql">{ex.sql}</code>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="query-btn query-btn-ghost"
              onClick={handleReset}
              title="Reset"
            >
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

        {/* SQL Input */}
        <div className="query-input-wrapper">
          <div className="query-line-numbers">
            {sql.split('\n').map((_, i) => (
              <span key={i} className="query-line-num">{i + 1}</span>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            className="query-textarea"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="SELECT * FROM ? WHERE ..."
            spellCheck={false}
            rows={Math.max(3, sql.split('\n').length)}
          />
        </div>

        {/* Hint */}
        <div className="query-hint">
          <span>Use <code>?</code> to reference your JSON data • <kbd>Ctrl+Enter</kbd> to run</span>
        </div>

        {/* Status Banner */}
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
                <span className="query-meta-error">
                  <AlertCircle size={13} />
                  Query Error
                </span>
              ) : (
                <>
                  <span className="query-meta-stat">
                    <Rows3 size={13} />
                    {result.rowCount.toLocaleString()} row{result.rowCount !== 1 ? 's' : ''}
                  </span>
                  <span className="query-meta-sep" />
                  <span className="query-meta-stat">
                    <Clock size={13} />
                    {result.executionTime}ms
                  </span>
                </>
              )}
            </div>

            {!result.error && (
              <div className="query-results-actions">
                {/* View Mode Toggle */}
                <div className="query-view-toggle">
                  <button
                    className={`query-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table view"
                  >
                    <Table2 size={13} />
                    <span>Table</span>
                  </button>
                  <button
                    className={`query-view-btn ${viewMode === 'raw' ? 'active' : ''}`}
                    onClick={() => setViewMode('raw')}
                    title="Raw JSON view"
                  >
                    <Braces size={13} />
                    <span>Raw</span>
                  </button>
                </div>

                <span className="query-meta-sep" />

                <button
                  className="query-btn query-btn-ghost"
                  onClick={handleCopyResult}
                  title="Copy result as JSON"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button
                  className="query-btn query-btn-ghost"
                  onClick={handleDownloadResult}
                  title="Download result as JSON"
                >
                  <Download size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Result Content */}
          <div className="query-result-content">
            {result.error ? (
              <div className="query-error-panel">
                <div className="query-error-icon">
                  <AlertCircle size={18} />
                </div>
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
              <div className="query-raw-wrapper">
                <pre className="query-raw-output">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && canRun && (
        <div className="query-empty-state">
          <div className="query-empty-icon">
            <Database size={32} />
          </div>
          <div className="query-empty-title">Ready to Query</div>
          <div className="query-empty-desc">
            Write a SQL query above and press <kbd>Run</kbd> or <kbd>Ctrl+Enter</kbd>
          </div>
        </div>
      )}
    </div>
  );
}
