'use client';

import { useEffect, useState } from 'react';
import { isTauri } from '@/utils/tauri';

/**
 * TauriWindowManager
 * 
 * Tauri uygulamasında splash screen benzeri deneyim sağlar.
 * - İlk yüklemede loading ekranı gösterir
 * - Uygulama tamamen yüklendiğinde pencereyi gösterir
 * - Web ortamında hiçbir şey yapmaz
 */
export default function TauriWindowManager() {
    const [isLoading, setIsLoading] = useState(true);
    const [isTauriEnv, setIsTauriEnv] = useState(false);

    useEffect(() => {
        // Client-side'da Tauri ortamı kontrol et
        const checkTauri = isTauri();
        setIsTauriEnv(checkTauri);

        if (!checkTauri) {
            setIsLoading(false);
            return;
        }

        const showWindow = async () => {
            try {
                // Tauri 2.0 window API'sini dinamik olarak yükle
                const { getCurrentWindow } = await import('@tauri-apps/api/window');
                const currentWindow = getCurrentWindow();

                // Biraz bekle - tüm JS'lerin yüklenmesi için
                await new Promise(resolve => setTimeout(resolve, 100));

                // Pencereyi göster
                await currentWindow.show();

                // Pencereyi odakla
                await currentWindow.setFocus();

                // Loading'i kapat
                setIsLoading(false);
            } catch (error) {
                console.error('Tauri pencere gösterme hatası:', error);
                setIsLoading(false);
            }
        };

        // DOM tamamen yüklendikten sonra pencereyi göster
        if (document.readyState === 'complete') {
            showWindow();
        } else {
            const handleLoad = () => {
                showWindow();
            };
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);

    // Web ortamında veya yükleme tamamlandıysa hiçbir şey gösterme
    if (!isTauriEnv || !isLoading) {
        return null;
    }

    // Tauri ortamında loading screen göster
    return (
        <div className="tauri-loading-screen">
            <div className="tauri-loading-logo">{'{}'}</div>
            <div className="tauri-loading-bar">
                <div className="tauri-loading-progress" />
            </div>
        </div>
    );
}
