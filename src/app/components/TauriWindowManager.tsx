'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { isTauri } from '@/utils/tauri';

function subscribeToWindowLoad(onLoad: () => void): () => void {
    if (document.readyState === 'complete') {
        onLoad();
        return () => {};
    }

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
}

/**
 * TauriWindowManager
 *
 * Tauri uygulamasında loading durumunu yönetir.
 * Pencere hemen görünür, içerik yüklenene kadar loading ekranı gösterilir.
 */
export default function TauriWindowManager() {
    const isTauriEnv = useSyncExternalStore(
        () => () => {},
        () => isTauri(),
        () => false,
    );
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!isTauriEnv) {
            return;
        }

        return subscribeToWindowLoad(() => {
            setTimeout(() => setIsReady(true), 100);
        });
    }, [isTauriEnv]);

    if (!isTauriEnv || isReady) {
        return null;
    }

    // Tauri ortamında loading screen göster
    return (
        <div className="tauri-loading-screen">
            <div className="tauri-loading-logo">{'{}'}</div>
            <div className="tauri-loading-text">JSON Formatter</div>
            <div className="tauri-loading-bar">
                <div className="tauri-loading-progress" />
            </div>
        </div>
    );
}
