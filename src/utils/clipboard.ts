/**
 * Clipboard Utilities - Tauri & Web Compatible
 */
import { isTauri, clipboard as tauriClipboard } from './tauri';

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    // Tauri ortamında native API kullan
    if (isTauri()) {
        return await tauriClipboard.writeText(text);
    }

    // Web ortamı
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch {
        return false;
    }
}

/**
 * Paste text from clipboard
 */
export async function pasteFromClipboard(): Promise<string | null> {
    // Tauri ortamında native API kullan
    if (isTauri()) {
        return await tauriClipboard.readText();
    }

    // Web ortamı
    try {
        if (navigator.clipboard && window.isSecureContext) {
            return await navigator.clipboard.readText();
        }
        return null;
    } catch {
        return null;
    }
}
