'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface ResultTableProps {
  data: unknown[];
  columns: string[];
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

function getCellValue(row: unknown, col: string): unknown {
  if (row !== null && typeof row === 'object' && !Array.isArray(row)) {
    return (row as Record<string, unknown>)[col];
  }
  if (col === 'value') return row;
  return undefined;
}

function formatCellValue(val: unknown): { display: string; type: string } {
  if (val === null || val === undefined) return { display: 'null', type: 'null' };
  if (typeof val === 'boolean') return { display: String(val), type: 'boolean' };
  if (typeof val === 'number') return { display: String(val), type: 'number' };
  if (typeof val === 'string') return { display: val, type: 'string' };
  if (Array.isArray(val)) return { display: `[Array(${val.length})]`, type: 'array' };
  if (typeof val === 'object') return { display: JSON.stringify(val), type: 'object' };
  return { display: String(val), type: 'unknown' };
}

function compareCells(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

export function ResultTable({ data, columns }: ResultTableProps) {
  const [sort, setSort] = useState<SortState>({ column: null, direction: null });

  const sortedData = useMemo(() => {
    if (!sort.column || !sort.direction) return data;
    return [...data].sort((a, b) => {
      const aVal = getCellValue(a, sort.column!);
      const bVal = getCellValue(b, sort.column!);
      const cmp = compareCells(aVal, bVal);
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  const handleSort = (col: string) => {
    setSort((prev) => {
      if (prev.column !== col) return { column: col, direction: 'asc' };
      if (prev.direction === 'asc') return { column: col, direction: 'desc' };
      return { column: null, direction: null };
    });
  };

  if (data.length === 0) {
    return (
      <div className="query-result-empty">
        <span>No results</span>
      </div>
    );
  }

  return (
    <div className="query-table-wrapper">
      <table className="query-table">
        <thead>
          <tr>
            <th className="query-table-th query-table-row-num">#</th>
            {columns.map((col) => (
              <th
                key={col}
                className="query-table-th query-table-th-sortable"
                onClick={() => handleSort(col)}
              >
                <span className="query-table-th-content">
                  <span>{col}</span>
                  <span className="query-sort-icon">
                    {sort.column === col ? (
                      sort.direction === 'asc' ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )
                    ) : (
                      <ChevronsUpDown size={12} className="query-sort-icon-inactive" />
                    )}
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr key={i} className="query-table-row">
              <td className="query-table-td query-table-row-num">{i + 1}</td>
              {columns.map((col) => {
                const { display, type } = formatCellValue(getCellValue(row, col));
                return (
                  <td key={col} className={`query-table-td query-cell-${type}`} title={display}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
