'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { runQuery, EXAMPLE_QUERIES, type QueryResult } from './QueryEngine';
import { ResultTable } from './ResultTable';

interface JsonQueryProps {
  data: string;
}

type ViewMode = 'table' | 'raw';

export function JsonQuery({ data }: JsonQueryProps) {
  const [sql, setSql] = useState('SELECT * FROM ?');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);

  // Parse JSON data
  const parsedData = React.useMemo(() => {
    if (!data.trim()) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  // Close examples dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (examplesRef.current && !examplesRef.current.contains(e.target as Node)) {
        setShowExamples(false);
      }
    };
    if (showExamples) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showExamples]);

  const handleRun = useCallback(async () => {
    if (!sql.trim() || !parsedData) return;
    setIsRunning(true);
    try {
      const res = await runQuery(sql.trim(), parsedData);
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  }, [sql, parsedData]);

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

  const selectExample = (querySql: string) => {
    setSql(querySql);
    setShowExamples(false);
    textareaRef.current?.focus();
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
            {/* Examples Dropdown */}
            <div className="query-examples-dropdown" ref={examplesRef}>
              <button
                className="query-btn query-btn-secondary"
                onClick={() => setShowExamples(!showExamples)}
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
                      onClick={() => selectExample(ex.sql)}
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
