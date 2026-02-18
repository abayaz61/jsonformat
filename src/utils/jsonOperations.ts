import type { JsonValidationResult } from '@/types';

/**
 * Format JSON string with specified indentation.
 * Also expands nested JSON strings (JSON-in-JSON) into proper objects.
 * Tolerates trailing invalid characters (commas, semicolons, etc.) after valid JSON.
 */
export function formatJson(input: string, indent: number = 2): string {
    const stripped = stripTrailingJunk(input);
    const candidates = [input, stripped, wrapAsArray(stripped)];
    for (const candidate of candidates) {
        try {
            const parsed = JSON.parse(candidate);
            const expanded = expandJsonStrings(parsed);
            return JSON.stringify(expanded, null, indent);
        } catch {
            // try next candidate
        }
    }
    throw new Error('Invalid JSON');
}

/**
 * Strip trailing non-JSON characters (commas, semicolons, whitespace, etc.)
 * that commonly appear in log outputs.
 */
function stripTrailingJunk(input: string): string {
    return input.replace(/[\s,;]+$/, '');
}

/**
 * Detect comma-separated JSON objects/arrays without surrounding [] brackets
 * and wrap them in an array. E.g.: {"a":1},{"b":2} → [{"a":1},{"b":2}]
 */
function wrapAsArray(input: string): string {
    const trimmed = input.trim();
    // Only wrap if it doesn't already start with [ and contains multiple values
    if (trimmed.startsWith('[')) return input;
    // Check if it looks like comma-separated objects/values
    if (trimmed.startsWith('{') || trimmed.startsWith('"') || /^[\d\-]/.test(trimmed)) {
        return '[' + trimmed + ']';
    }
    return input;
}

/**
 * Recursively walk a parsed JSON value and expand any string values
 * that are themselves valid JSON into parsed objects.
 */
export function expandJsonStrings(value: unknown): unknown {
    if (typeof value === 'string') {
        // Try to parse the string as JSON
        const trimmed = value.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                const parsed = JSON.parse(trimmed);
                // Recursively expand in case of nested-nested JSON
                return expandJsonStrings(parsed);
            } catch {
                return value;
            }
        }
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(item => expandJsonStrings(item));
    }

    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            result[key] = expandJsonStrings(val);
        }
        return result;
    }

    return value;
}

export interface PartialFormatResult {
    result: string;
    isPartial: boolean;
}

/**
 * Attempt to format as much valid JSON as possible from the beginning of the input.
 * If the full input is valid JSON, formats it normally.
 * If only a prefix is valid, formats that prefix and appends the broken remainder.
 */
export function partialFormatJson(input: string, indent: number = 2): PartialFormatResult {
    // First, try full parse
    try {
        const parsed = JSON.parse(input);
        return { result: JSON.stringify(parsed, null, indent), isPartial: false };
    } catch {
        // Continue to partial formatting
    }

    const trimmed = input.trim();
    if (!trimmed) {
        return { result: input, isPartial: false };
    }

    // Find the largest valid JSON prefix by tracking structure depth
    let lastValidEnd = -1;
    let i = 0;
    const len = trimmed.length;

    while (i < len) {
        // Skip whitespace
        while (i < len && /\s/.test(trimmed[i])) i++;
        if (i >= len) break;

        // Try to find a complete JSON value starting at position i
        const end = findJsonValueEnd(trimmed, i);
        if (end === -1) break;

        // We found a complete value ending at 'end'
        // Try to parse from the beginning to 'end + 1'
        const candidate = trimmed.substring(0, end + 1);
        try {
            JSON.parse(candidate);
            lastValidEnd = end;
        } catch {
            // Not valid as a whole, but individual value was structurally complete
        }

        // Move past this value
        i = end + 1;

        // Skip whitespace and comma after value
        while (i < len && /\s/.test(trimmed[i])) i++;
        if (i < len && trimmed[i] === ',') {
            i++;
        } else {
            break; // No more values at top level
        }
    }

    if (lastValidEnd === -1) {
        // Could not find any valid JSON prefix, return original
        throw new Error('Invalid JSON');
    }

    const validPart = trimmed.substring(0, lastValidEnd + 1);
    const remainder = trimmed.substring(lastValidEnd + 1).trim();

    try {
        const parsed = JSON.parse(validPart);
        const expanded = expandJsonStrings(parsed);
        const formatted = JSON.stringify(expanded, null, indent);
        if (!remainder) {
            return { result: formatted, isPartial: false };
        }
        return {
            result: formatted + '\n\n' + remainder,
            isPartial: true
        };
    } catch {
        throw new Error('Invalid JSON');
    }
}

/**
 * Find the end index of a JSON value starting at position `start`.
 * Returns the index of the last character of the value, or -1 if invalid.
 * Handles: objects, arrays, strings, numbers, booleans, null.
 */
function findJsonValueEnd(str: string, start: number): number {
    if (start >= str.length) return -1;
    const ch = str[start];

    if (ch === '{' || ch === '[') {
        return findMatchingBracket(str, start, ch === '{' ? '}' : ']');
    }
    if (ch === '"') {
        return findStringEnd(str, start);
    }
    // true, false, null
    if (str.startsWith('true', start)) return start + 3;
    if (str.startsWith('false', start)) return start + 4;
    if (str.startsWith('null', start)) return start + 3;

    // number
    if (ch === '-' || (ch >= '0' && ch <= '9')) {
        return findNumberEnd(str, start);
    }

    return -1;
}

/**
 * Find the matching closing bracket/brace, respecting nesting and string literals.
 */
function findMatchingBracket(str: string, start: number, closeChar: string): number {
    let depth = 0;
    let i = start;
    const len = str.length;

    while (i < len) {
        const ch = str[i];
        if (ch === '"') {
            const end = findStringEnd(str, i);
            if (end === -1) return -1;
            i = end + 1;
            continue;
        }
        if (ch === str[start]) {
            depth++;
        } else if (ch === closeChar) {
            depth--;
            if (depth === 0) return i;
        }
        i++;
    }
    return -1; // Unmatched
}

/**
 * Find the end of a JSON string literal (the closing quote index).
 */
function findStringEnd(str: string, start: number): number {
    let i = start + 1; // skip opening quote
    const len = str.length;

    while (i < len) {
        const ch = str[i];
        if (ch === '\\') {
            i += 2; // skip escaped character
            continue;
        }
        if (ch === '"') {
            return i;
        }
        i++;
    }
    return -1; // Unterminated string
}

/**
 * Find the end of a JSON number.
 */
function findNumberEnd(str: string, start: number): number {
    let i = start;
    const len = str.length;

    if (i < len && str[i] === '-') i++;
    if (i >= len || str[i] < '0' || str[i] > '9') return -1;
    while (i < len && str[i] >= '0' && str[i] <= '9') i++;
    if (i < len && str[i] === '.') {
        i++;
        if (i >= len || str[i] < '0' || str[i] > '9') return -1;
        while (i < len && str[i] >= '0' && str[i] <= '9') i++;
    }
    if (i < len && (str[i] === 'e' || str[i] === 'E')) {
        i++;
        if (i < len && (str[i] === '+' || str[i] === '-')) i++;
        if (i >= len || str[i] < '0' || str[i] > '9') return -1;
        while (i < len && str[i] >= '0' && str[i] <= '9') i++;
    }
    return i - 1;
}

/**
 * Minify JSON string (remove all whitespace)
 */
export function minifyJson(input: string): string {
    try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed);
    } catch {
        throw new Error('Invalid JSON');
    }
}

/**
 * Validate JSON string and return detailed result
 */
export function validateJson(input: string): JsonValidationResult {
    if (!input.trim()) {
        return { valid: true };
    }

    try {
        JSON.parse(input);
        return { valid: true };
    } catch (e) {
        const error = e as SyntaxError;
        const match = error.message.match(/at position (\d+)/);
        const position = match ? parseInt(match[1], 10) : undefined;

        let line: number | undefined;
        let column: number | undefined;

        if (position !== undefined) {
            const lines = input.substring(0, position).split('\n');
            line = lines.length;
            column = lines[lines.length - 1].length + 1;
        }

        return {
            valid: false,
            error: error.message,
            line,
            column
        };
    }
}

/**
 * Parse JSON string safely
 */
export function parseJson(input: string): object | null {
    try {
        return JSON.parse(input);
    } catch {
        return null;
    }
}

/**
 * Check if string is valid JSON
 */
export function isValidJson(input: string): boolean {
    return validateJson(input).valid;
}
