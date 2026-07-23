import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

export interface EpochInfo {
    utc: string;
    local: string;
    iso: string;
    relative: string;
    isSeconds: boolean;
}

export function parseEpochTimestamp(val: number): EpochInfo | null {
    if (!Number.isFinite(val) || !Number.isInteger(val)) return null;

    let ms = val;
    let isSeconds = false;

    if (val >= 1000000000 && val <= 4102444800) {
        ms = val * 1000;
        isSeconds = true;
    } else if (val >= 1000000000000 && val <= 4102444800000) {
        ms = val;
        isSeconds = false;
    } else {
        return null;
    }

    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return null;

    // UTC string
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const secs = String(date.getUTCSeconds()).padStart(2, '0');
    const utc = `${year}-${month}-${day} ${hours}:${minutes}:${secs} UTC`;

    // Local string
    const local = date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    // ISO string
    const iso = date.toISOString();

    // Relative string calculation
    const now = Date.now();
    const diffMs = ms - now;
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    let relative = '';
    if (Math.abs(diffSecs) < 60) {
        relative = diffSecs >= 0 ? `in ${diffSecs}s` : `${Math.abs(diffSecs)}s ago`;
    } else if (Math.abs(diffMins) < 60) {
        relative = diffMins >= 0 ? `in ${diffMins}m` : `${Math.abs(diffMins)}m ago`;
    } else if (Math.abs(diffHours) < 24) {
        relative = diffHours >= 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
    } else {
        relative = diffDays >= 0 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
    }

    return { utc, local, iso, relative, isSeconds };
}

export function findEpochHoverAtPosition(
    model: editor.ITextModel,
    position: { lineNumber: number; column: number },
    monaco: Monaco
) {
    const word = model.getWordAtPosition(position);
    if (!word || !/^\d+$/.test(word.word)) {
        return null;
    }

    const val = Number(word.word);
    const epochInfo = parseEpochTimestamp(val);
    if (!epochInfo) {
        return null;
    }

    // Try to extract property key from line content (e.g., "exp": 1784820249)
    const lineContent = model.getLineContent(position.lineNumber);
    const beforeWord = lineContent.slice(0, word.startColumn - 1);
    const keyMatch = beforeWord.match(/"([^"]+)"\s*:\s*$/);
    const keyName = keyMatch ? keyMatch[1] : null;

    const title = keyName ? `🕒 **Unix Timestamp (\`${keyName}\`)**` : `🕒 **Unix Timestamp**`;

    return {
        range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
        ),
        contents: [
            { value: title },
            {
                value: [
                    `📅 **UTC:** \`${epochInfo.utc}\``,
                    `🌐 **Local:** \`${epochInfo.local}\``,
                    `🏷️ **ISO 8601:** \`${epochInfo.iso}\``,
                    `⏳ **Relative:** *${epochInfo.relative}*`
                ].join('\n\n')
            }
        ]
    };
}
