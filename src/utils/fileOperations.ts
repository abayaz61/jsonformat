/**
 * File Operations - Tauri & Web Compatible
 */
import { isTauri, fileSystem as tauriFs } from './tauri';

/**
 * Download content as a file
 */
export async function downloadJson(content: string, filename: string = 'data.json'): Promise<boolean> {
    // Tauri ortamında native dosya kaydetme dialogu kullan
    if (isTauri()) {
        return await tauriFs.saveFile(content, filename);
    }

    // Web ortamı - blob download
    try {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Read file content as string
 */
export function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error('Failed to read file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Create file input and trigger file selection
 * Tauri ortamında native dialog kullanır
 */
export async function openFileDialog(accept: string = '.json,application/json'): Promise<{ content: string; name: string } | null> {
    // Tauri ortamında native dosya açma dialogu kullan
    if (isTauri()) {
        return await tauriFs.openFile();
    }

    // Web ortamı - input element
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    const content = await readFile(file);
                    resolve({ content, name: file.name });
                } catch {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        };
        input.click();
    });
}
