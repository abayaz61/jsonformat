/**
 * Tauri Platform Detection and Native APIs
 * 
 * Bu dosya Tauri native uygulaması ile web uygulaması arasında
 * uyumluluk sağlar. Tauri'de çalışırken native API'leri,
 * tarayıcıda çalışırken web API'lerini kullanır.
 */

// Tauri ortamında mıyız kontrol et
export const isTauri = (): boolean => {
    if (typeof window === 'undefined') return false;
    return '__TAURI_INTERNALS__' in window;
};

// Platform bilgisi - userAgent tabanlı (plugin gerektirmez)
export const getPlatform = (): 'windows' | 'linux' | 'macos' | 'web' => {
    if (!isTauri()) return 'web';

    // Tauri ortamında userAgent ile platform tespiti
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('windows')) return 'windows';
    if (userAgent.includes('linux')) return 'linux';
    if (userAgent.includes('mac')) return 'macos';
    return 'web';
};

// Clipboard işlemleri
export const clipboard = {
    async writeText(text: string): Promise<boolean> {
        if (isTauri()) {
            try {
                const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
                await writeText(text);
                return true;
            } catch (error) {
                console.error('Tauri clipboard yazma hatası:', error);
                return false;
            }
        }

        // Web fallback
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    },

    async readText(): Promise<string | null> {
        if (isTauri()) {
            try {
                const { readText } = await import('@tauri-apps/plugin-clipboard-manager');
                return await readText();
            } catch (error) {
                console.error('Tauri clipboard okuma hatası:', error);
                return null;
            }
        }

        // Web fallback
        try {
            return await navigator.clipboard.readText();
        } catch {
            return null;
        }
    }
};

// Dosya işlemleri
export const fileSystem = {
    async openFile(): Promise<{ content: string; name: string } | null> {
        if (isTauri()) {
            try {
                const { open } = await import('@tauri-apps/plugin-dialog');
                const { readTextFile } = await import('@tauri-apps/plugin-fs');

                const selected = await open({
                    multiple: false,
                    filters: [{
                        name: 'JSON',
                        extensions: ['json', 'txt']
                    }]
                });

                if (selected && typeof selected === 'string') {
                    const content = await readTextFile(selected);
                    const name = selected.split(/[\\/]/).pop() || 'file.json';
                    return { content, name };
                }
                return null;
            } catch (error) {
                console.error('Tauri dosya açma hatası:', error);
                return null;
            }
        }

        // Web fallback - input element kullan
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.txt';
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const content = await file.text();
                    resolve({ content, name: file.name });
                } else {
                    resolve(null);
                }
            };
            input.click();
        });
    },

    async saveFile(content: string, defaultName: string = 'data.json'): Promise<boolean> {
        if (isTauri()) {
            try {
                const { save } = await import('@tauri-apps/plugin-dialog');
                const { writeTextFile } = await import('@tauri-apps/plugin-fs');

                const filePath = await save({
                    defaultPath: defaultName,
                    filters: [{
                        name: 'JSON',
                        extensions: ['json']
                    }]
                });

                if (filePath) {
                    await writeTextFile(filePath, content);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('Tauri dosya kaydetme hatası:', error);
                return false;
            }
        }

        // Web fallback - download
        try {
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = defaultName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// Dialog işlemleri
export const dialog = {
    async showMessage(title: string, message: string): Promise<void> {
        if (isTauri()) {
            try {
                const { message: showMsg } = await import('@tauri-apps/plugin-dialog');
                await showMsg(message, { title });
                return;
            } catch (error) {
                console.error('Tauri dialog hatası:', error);
            }
        }

        // Web fallback
        alert(`${title}\n\n${message}`);
    },

    async confirm(title: string, message: string): Promise<boolean> {
        if (isTauri()) {
            try {
                const { ask } = await import('@tauri-apps/plugin-dialog');
                return await ask(message, { title });
            } catch (error) {
                console.error('Tauri confirm hatası:', error);
                return false;
            }
        }

        // Web fallback
        return confirm(`${title}\n\n${message}`);
    }
};

// Harici URL açma
export const openExternal = async (url: string): Promise<void> => {
    if (isTauri()) {
        try {
            const { open } = await import('@tauri-apps/plugin-shell');
            await open(url);
            return;
        } catch (error) {
            console.error('Tauri URL açma hatası:', error);
        }
    }

    // Web fallback
    window.open(url, '_blank', 'noopener,noreferrer');
};
