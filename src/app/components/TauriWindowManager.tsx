'use client';

import { useEffect, useState } from 'react';
import { isTauri } from '@/utils/tauri';

/**
 * TauriWindowManager
 * 
 * Tauri uygulamasında loading durumunu yönetir.
 * Pencere hemen görünür, içerik yüklenene kadar loading ekranı gösterilir.
 */
export default function TauriWindowManager() {
    const [isReady, setIsReady] = useState(false);
    const isTauriEnv = isTauri();

    useEffect(() => {
        if (!isTauriEnv) {
            return;
        }

        // DOM tamamen yüklendikten sonra loading'i kapat
        const handleReady = () => {
            // Kısa bir gecikme - smooth transition için
            setTimeout(() => setIsReady(true), 100);
        };

        if (document.readyState === 'complete') {
            handleReady();
        } else {
            window.addEventListener('load', handleReady);
            return () => window.removeEventListener('load', handleReady);
        }
    }, [isTauriEnv]);

    // Web ortamında veya hazırsa hiçbir şey gösterme
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
