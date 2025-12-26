'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseFullscreenReturn {
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
    fullscreenRef: React.RefObject<HTMLElement | null>;
}

/**
 * Hook for fullscreen API
 */
export function useFullscreen(): UseFullscreenReturn {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullscreenRef = useRef<HTMLElement | null>(null);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const enterFullscreen = useCallback(async () => {
        const element = fullscreenRef.current || document.documentElement;

        try {
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if ((element as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
                await (element as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
            } else if ((element as unknown as { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
                await (element as unknown as { mozRequestFullScreen: () => Promise<void> }).mozRequestFullScreen();
            } else if ((element as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
                await (element as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
            }
        } catch (error) {
            console.error('Error entering fullscreen:', error);
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
                await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
            } else if ((document as unknown as { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen) {
                await (document as unknown as { mozCancelFullScreen: () => Promise<void> }).mozCancelFullScreen();
            } else if ((document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
                await (document as unknown as { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
            }
        } catch (error) {
            console.error('Error exiting fullscreen:', error);
        }
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (isFullscreen) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }, [isFullscreen, enterFullscreen, exitFullscreen]);

    return {
        isFullscreen,
        toggleFullscreen,
        enterFullscreen,
        exitFullscreen,
        fullscreenRef
    };
}
