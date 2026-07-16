export interface JwtMatch {
    token: string;
    start: number;
    end: number;
    payload: Record<string, unknown>;
}

const JWT_PATTERN = /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const JWT_TIME_CLAIMS = new Set(['exp', 'iat', 'nbf']);

function decodeBase64Url(value: string): string | null {
    try {
        const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
        const padding = (4 - (normalized.length % 4)) % 4;
        const padded = normalized + '='.repeat(padding);

        if (typeof atob === 'function') {
            const binary = atob(padded);
            const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
            return new TextDecoder().decode(bytes);
        }

        const buffer = globalThis.Buffer;
        if (buffer) {
            return buffer.from(padded, 'base64').toString('utf8');
        }

        return null;
    } catch {
        return null;
    }
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    const segments = token.split('.');
    if (segments.length !== 3) return null;

    const payloadText = decodeBase64Url(segments[1]);
    if (!payloadText) return null;

    try {
        const parsed = JSON.parse(payloadText);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export function findJwtAtOffset(source: string, offset: number): JwtMatch | null {
    for (const match of source.matchAll(JWT_PATTERN)) {
        const token = match[0];
        const start = match.index ?? -1;
        const end = start + token.length;
        if (start === -1 || offset < start || offset >= end) {
            continue;
        }

        const payload = decodeJwtPayload(token);
        if (!payload) {
            return null;
        }

        return { token, start, end, payload };
    }

    return null;
}

function formatUtcDate(seconds: number): string | null {
    if (!Number.isInteger(seconds)) return null;

    const date = new Date(seconds * 1000);
    if (Number.isNaN(date.getTime())) return null;

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const secs = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${secs} UTC`;
}

function formatTooltipValue(value: unknown, indentLevel: number, key?: string): string {
    const indent = '  '.repeat(indentLevel);
    const childIndent = '  '.repeat(indentLevel + 1);

    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        return `[\n${value.map((item) => `${childIndent}${formatTooltipValue(item, indentLevel + 1)}`).join(',\n')}\n${indent}]`;
    }

    if (value && typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0) return '{}';

        return `{\n${entries
            .map(([entryKey, entryValue]) => (
                `${childIndent}${JSON.stringify(entryKey)}: ${formatTooltipValue(entryValue, indentLevel + 1, entryKey)}`
            ))
            .join(',\n')}\n${indent}}`;
    }

    if (typeof value === 'number' && key && JWT_TIME_CLAIMS.has(key)) {
        const utcDate = formatUtcDate(value);
        return utcDate ? `${value} (${utcDate})` : String(value);
    }

    return JSON.stringify(value);
}

export function formatJwtPayloadTooltip(token: string): string | null {
    const payload = decodeJwtPayload(token);
    return payload ? formatTooltipValue(payload, 0) : null;
}

export function formatJwtPayloadHoverMarkdown(token: string): string | null {
    const tooltip = formatJwtPayloadTooltip(token);
    return tooltip ? `\`\`\`json\n${tooltip}\n\`\`\`` : null;
}
