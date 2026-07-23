export interface JwtMatch {
    token: string;
    start: number;
    end: number;
    payload: Record<string, unknown>;
}

export interface DecodedJwt {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature?: string;
}

const JWT_PATTERN = /[A-Za-z0-9\-_+/=]+\.[A-Za-z0-9\-_+/=]+\.?[A-Za-z0-9\-_+/=]*/g;
const JWT_TIME_CLAIMS = new Set(['exp', 'iat', 'nbf', 'auth_time', 'updated_at']);

export function formatJwtTimeClaims(payload: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
        if (typeof value === 'number' && JWT_TIME_CLAIMS.has(key)) {
            const utcDate = formatUtcDate(value);
            result[key] = utcDate ? `${value} (${utcDate})` : value;
        } else if (value && typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result[key] = formatJwtTimeClaims(value as Record<string, unknown>);
        } else {
            result[key] = value;
        }
    }
    return result;
}

function decodeBase64Url(value: string): string | null {
    try {
        const clean = value.replace(/\s+/g, '');
        const normalized = clean.replace(/-/g, '+').replace(/_/g, '/');
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
    const parsed = parseJwt(token);
    return parsed ? parsed.payload : null;
}

export function parseJwt(token: string): DecodedJwt | null {
    if (!token || typeof token !== 'string') return null;

    let cleanToken = token.trim();
    cleanToken = cleanToken.replace(/^[\s"';,]+|[\s"';,]+$/g, '');

    if (cleanToken.toLowerCase().startsWith('bearer ')) {
        cleanToken = cleanToken.slice(7).trim();
    }
    cleanToken = cleanToken.replace(/^[\s"';,]+|[\s"';,]+$/g, '');

    const segments = cleanToken.split('.');
    if (segments.length < 2 || segments.length > 3) return null;

    const seg0 = segments[0].replace(/\s+/g, '');
    const seg1 = segments[1].replace(/\s+/g, '');
    const seg2 = segments[2] ? segments[2].replace(/\s+/g, '') : undefined;

    const headerText = decodeBase64Url(seg0);
    const payloadText = decodeBase64Url(seg1);
    if (!headerText || !payloadText) return null;

    try {
        const header = JSON.parse(headerText);
        const payload = JSON.parse(payloadText);

        if (!header || typeof header !== 'object' || Array.isArray(header)) return null;
        if (!payload || typeof payload !== 'object') return null;

        const result: DecodedJwt = {
            header,
            payload: formatJwtTimeClaims(payload)
        };

        if (seg2) {
            result.signature = seg2;
        }

        return result;
    } catch {
        return null;
    }
}

export function extractJwt(source: string): DecodedJwt | null {
    if (!source || typeof source !== 'string') return null;

    const directParse = parseJwt(source);
    if (directParse) return directParse;

    for (const match of source.matchAll(JWT_PATTERN)) {
        const token = match[0];
        const parsed = parseJwt(token);
        if (parsed) {
            return parsed;
        }
    }

    return null;
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
