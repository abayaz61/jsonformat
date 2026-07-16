export interface JwtMatch {
    token: string;
    start: number;
    end: number;
    payload: Record<string, unknown>;
}

const JWT_PATTERN = /[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

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

export function formatJwtPayloadTooltip(token: string): string | null {
    const payload = decodeJwtPayload(token);
    return payload ? JSON.stringify(payload, null, 2) : null;
}
