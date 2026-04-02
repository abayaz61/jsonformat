// AlaSQL-based query engine for JSON data
// We use dynamic import to avoid SSR issues

export interface QueryResult {
  data: unknown[];
  columns: string[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

function flattenData(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data !== null && typeof data === 'object') return [data];
  return [{ value: data }];
}

function extractColumns(data: unknown[]): string[] {
  if (data.length === 0) return [];
  const cols = new Set<string>();
  // scan up to first 50 rows to discover columns
  const sample = data.slice(0, 50);
  for (const row of sample) {
    if (row !== null && typeof row === 'object' && !Array.isArray(row)) {
      Object.keys(row as object).forEach((k) => cols.add(k));
    } else {
      cols.add('value');
    }
  }
  return Array.from(cols);
}

export async function runQuery(sql: string, jsonData: unknown): Promise<QueryResult> {
  const start = performance.now();

  try {
    // Dynamic import to avoid SSR
    const alasql = (await import('alasql')).default;

    const flatData = flattenData(jsonData);

    // Replace ? placeholder with the actual data binding
    // AlaSQL supports: SELECT * FROM ? where ? is passed as array arg
    const result = alasql(sql, [flatData]) as unknown[];

    const end = performance.now();
    const resultArray = Array.isArray(result) ? result : [result];
    const columns = extractColumns(resultArray);

    return {
      data: resultArray,
      columns,
      rowCount: resultArray.length,
      executionTime: parseFloat((end - start).toFixed(2)),
    };
  } catch (err: unknown) {
    const end = performance.now();
    const message = err instanceof Error ? err.message : String(err);
    return {
      data: [],
      columns: [],
      rowCount: 0,
      executionTime: parseFloat((end - start).toFixed(2)),
      error: message,
    };
  }
}

export const EXAMPLE_QUERIES = [
  { label: 'Select All', sql: 'SELECT * FROM ?' },
  { label: 'Select Fields', sql: 'SELECT id, name FROM ?' },
  { label: 'Filter WHERE', sql: "SELECT * FROM ? WHERE active = true" },
  { label: 'ORDER BY', sql: 'SELECT * FROM ? ORDER BY id DESC' },
  { label: 'LIMIT', sql: 'SELECT * FROM ? LIMIT 10' },
  { label: 'COUNT', sql: 'SELECT COUNT(*) as total FROM ?' },
  { label: 'DISTINCT', sql: 'SELECT DISTINCT status FROM ?' },
  { label: 'Search String', sql: "SELECT * FROM ? WHERE name LIKE '%john%'" },
];
