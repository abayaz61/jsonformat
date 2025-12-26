import type { JsonValidationResult } from '@/types';

/**
 * Format JSON string with specified indentation
 */
export function formatJson(input: string, indent: number = 2): string {
    try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, indent);
    } catch {
        throw new Error('Invalid JSON');
    }
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
