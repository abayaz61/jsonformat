import type { JsonValidationResult } from '@/types';

export interface FormatOptions {
    ignoreNull?: boolean;
    ignoreDefaultDates?: boolean;
    ignoreZeros?: boolean;
    convertDotNetDates?: boolean;
}

/**
 * Format JSON string with specified indentation.
 * Also expands nested JSON strings (JSON-in-JSON) into proper objects.
 * Tolerates trailing invalid characters (commas, semicolons, etc.) after valid JSON.
 */
export function formatJson(input: string, indent: number = 2, options: FormatOptions = {}): string {
    const stripped = stripTrailingJunk(input);
    const candidates = [input, stripped, wrapAsArray(stripped)];
    for (const candidate of candidates) {
        try {
            const parsed = JSON.parse(candidate);
            const expanded = expandJsonStrings(parsed);
            const filtered = applyFilters(expanded, options);
            return JSON.stringify(filtered, null, indent);
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
 * Detect multiple JSON values without surrounding [] brackets and/or missing commas.
 * Inserts commas between adjacent values and wraps in array.
 * E.g.: {"a":1} {"b":2} → [{"a":1},{"b":2}]
 */
function wrapAsArray(input: string): string {
    const trimmed = input.trim();
    // Only process if it doesn't already start with [
    if (trimmed.startsWith('[')) return input;
    // Check if it looks like it starts with a JSON value
    if (!(trimmed.startsWith('{') || trimmed.startsWith('"') || /^[\d\-]/.test(trimmed))) {
        return input;
    }

    // Insert missing commas between adjacent JSON values
    // e.g. } { → }, { or } \n { → }, \n {
    const fixed = insertMissingCommas(trimmed);
    return '[' + fixed + ']';
}

/**
 * Insert commas between adjacent JSON values where commas are missing.
 * Handles: }\s*{ , ]\s*{ , }\s*[ , ]\s*[ , }\s*" , etc.
 * Respects string literals and nested structures.
 */
function insertMissingCommas(input: string): string {
    const result: string[] = [];
    let i = 0;
    const len = input.length;

    while (i < len) {
        // Skip whitespace
        if (/\s/.test(input[i])) {
            result.push(input[i]);
            i++;
            continue;
        }

        // Find the end of the current JSON value
        const end = findJsonValueEnd(input, i);
        if (end === -1) {
            // Can't parse, just push rest
            result.push(input.substring(i));
            break;
        }

        // Push the value
        result.push(input.substring(i, end + 1));
        i = end + 1;

        // Skip whitespace after value
        const wsStart = i;
        while (i < len && /\s/.test(input[i])) i++;

        if (i >= len) {
            // End of input
            result.push(input.substring(wsStart, i));
            break;
        }

        // Check if next char is already a comma
        if (input[i] === ',') {
            result.push(input.substring(wsStart, i + 1));
            i++;
            continue;
        }

        // Check if next char starts a new JSON value
        const nextCh = input[i];
        if (nextCh === '{' || nextCh === '[' || nextCh === '"' ||
            nextCh === '-' || (nextCh >= '0' && nextCh <= '9') ||
            input.startsWith('true', i) || input.startsWith('false', i) || input.startsWith('null', i)) {
            // Missing comma — insert one
            result.push(input.substring(wsStart));
            // Find the whitespace portion and inject comma
            const ws = input.substring(wsStart, i);
            result.length--; // remove last push
            result.push(',');
            result.push(ws || ' ');
            continue;
        }

        // Unknown char, push and continue
        result.push(input.substring(wsStart, i + 1));
        i++;
    }

    return result.join('');
}

/**
 * Try to extract embedded JSON from a string that may have a prefix.
 * e.g. "betastore yanıtı: OK - {\"d\":{...}}" → { prefix, json }
 */
function extractEmbeddedJson(str: string): { prefix: string; json: unknown } | null {
    // Find the first { or [ that could start a JSON value
    const braceIdx = str.indexOf('{');
    const bracketIdx = str.indexOf('[');
    let startIdx = -1;

    if (braceIdx === -1 && bracketIdx === -1) return null;
    if (braceIdx === -1) startIdx = bracketIdx;
    else if (bracketIdx === -1) startIdx = braceIdx;
    else startIdx = Math.min(braceIdx, bracketIdx);

    // Only consider if there's a prefix (otherwise the normal path handles it)
    if (startIdx === 0) return null;

    const candidate = str.substring(startIdx).trim();
    if ((candidate.startsWith('{') && candidate.endsWith('}')) ||
        (candidate.startsWith('[') && candidate.endsWith(']'))) {
        try {
            const parsed = JSON.parse(candidate);
            return { prefix: str.substring(0, startIdx).trim(), json: parsed };
        } catch {
            // Not valid JSON
        }
    }
    return null;
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
                // Fall through to embedded extraction
            }
        }

        // Try to extract embedded JSON from a string with prefix text
        // e.g. "betastore yanıtı: OK - {\"d\":{...}}"
        const embedded = extractEmbeddedJson(trimmed);
        if (embedded) {
            return expandJsonStrings(embedded.json);
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

/**
 * Recursively remove null values from a parsed JSON structure.
 */
export function removeNulls(value: unknown): unknown {
    if (value === null) return undefined;

    if (Array.isArray(value)) {
        return value.filter(item => item !== null).map(item => removeNulls(item));
    }

    if (typeof value === 'object' && value !== null) {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            if (val !== null) {
                result[key] = removeNulls(val);
            }
        }
        return result;
    }

    return value;
}

/**
 * Check if a string looks like a default/empty date.
 */
function isDefaultDate(value: string): boolean {
    const defaultDatePatterns = [
        /^0001-01-01/,
        /^1970-01-01T00:00:00/,
        /^01\.01\.0001/,
        /^01\/01\/0001/,
        /^0001\/01\/01/,
    ];
    return defaultDatePatterns.some(p => p.test(value.trim()));
}

/**
 * Recursively remove default/empty date values.
 */
export function removeDefaultDates(value: unknown): unknown {
    if (typeof value === 'string' && isDefaultDate(value)) {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value
            .filter(item => !(typeof item === 'string' && isDefaultDate(item)))
            .map(item => removeDefaultDates(item));
    }

    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            if (!(typeof val === 'string' && isDefaultDate(val))) {
                result[key] = removeDefaultDates(val);
            }
        }
        return result;
    }

    return value;
}

/**
 * Recursively remove zero numeric values.
 */
export function removeZeros(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value
            .filter(item => item !== 0)
            .map(item => removeZeros(item));
    }

    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            if (val !== 0) {
                result[key] = removeZeros(val);
            }
        }
        return result;
    }

    return value;
}

/**
 * Apply all enabled filters to a parsed JSON value.
 */
/**
 * Recursively convert .NET-style date strings like /Date(1234567890)/ to ISO date strings.
 */
export function convertDotNetDates(value: unknown): unknown {
    if (typeof value === 'string') {
        const dotNetPattern = /^[/\\]*Date\((\d+)([+-]\d{4})?\)[/\\]*$/;
        const match = value.match(dotNetPattern);
        if (match) {
            const timestamp = parseInt(match[1], 10);
            const date = new Date(timestamp);
            return date.toISOString().replace('T', ' ').replace('Z', '');
        }
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(item => convertDotNetDates(item));
    }

    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            result[key] = convertDotNetDates(val);
        }
        return result;
    }

    return value;
}

function applyFilters(value: unknown, options: FormatOptions): unknown {
    let result = value;
    if (options.ignoreNull) result = removeNulls(result);
    if (options.ignoreDefaultDates) result = removeDefaultDates(result);
    if (options.ignoreZeros) result = removeZeros(result);
    if (options.convertDotNetDates) result = convertDotNetDates(result);
    return result;
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
export function partialFormatJson(input: string, indent: number = 2, options: FormatOptions = {}): PartialFormatResult {
    // First, try full parse
    try {
        const parsed = JSON.parse(input);
        const expanded = expandJsonStrings(parsed);
        const filtered = applyFilters(expanded, options);
        return { result: JSON.stringify(filtered, null, indent), isPartial: false };
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
        const filtered = applyFilters(expanded, options);
        const formatted = JSON.stringify(filtered, null, indent);
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
