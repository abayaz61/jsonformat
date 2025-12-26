'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTheme, useLanguage } from '@/contexts';
import type { ColorTheme } from '@/types';

// 20 color themes with display colors
const colorThemes: { id: ColorTheme; label: string; color: string }[] = [
    { id: 'ocean', label: 'Ocean', color: '#667eea' },
    { id: 'forest', label: 'Forest', color: '#48bb78' },
    { id: 'sunset', label: 'Sunset', color: '#ed8936' },
    { id: 'purple', label: 'Purple', color: '#9f7aea' },
    { id: 'rose', label: 'Rose', color: '#ed64a6' },
    { id: 'midnight', label: 'Midnight', color: '#4fd1c5' },
    { id: 'crimson', label: 'Crimson', color: '#ef4444' },
    { id: 'gold', label: 'Gold', color: '#eab308' },
    { id: 'emerald', label: 'Emerald', color: '#10b981' },
    { id: 'sapphire', label: 'Sapphire', color: '#3b82f6' },
    { id: 'amber', label: 'Amber', color: '#f59e0b' },
    { id: 'indigo', label: 'Indigo', color: '#6366f1' },
    { id: 'coral', label: 'Coral', color: '#f97316' },
    { id: 'slate', label: 'Slate', color: '#64748b' },
    { id: 'lime', label: 'Lime', color: '#84cc16' },
    { id: 'violet', label: 'Violet', color: '#8b5cf6' },
    { id: 'bronze', label: 'Bronze', color: '#a16207' },
    { id: 'cyan', label: 'Cyan', color: '#06b6d4' },
    { id: 'magenta', label: 'Magenta', color: '#d946ef' },
    { id: 'olive', label: 'Olive', color: '#65a30d' }
];

interface ColorPaletteCarouselProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ColorPaletteCarousel({ isOpen, onClose }: ColorPaletteCarouselProps) {
    const { theme, setColor } = useTheme();
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    // Set initial index to current theme
    useEffect(() => {
        if (isOpen) {
            const idx = colorThemes.findIndex(ct => ct.id === theme.color);
            if (idx !== -1) {
                setCurrentIndex(idx);
            }
            isInitialMount.current = true;
            // Focus container for keyboard events
            setTimeout(() => {
                containerRef.current?.focus();
            }, 100);
        }
    }, [isOpen, theme.color]);

    // Apply theme when currentIndex changes (skip on initial mount)
    useEffect(() => {
        if (isOpen && !isInitialMount.current) {
            const newColor = colorThemes[currentIndex].id;
            if (theme.color !== newColor) {
                setColor(newColor);
            }
        }
        isInitialMount.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? colorThemes.length - 1 : prev - 1));
    }, []);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === colorThemes.length - 1 ? 0 : prev + 1));
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrev();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNext();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    }, [goToPrev, goToNext, onClose]);

    const handleSelect = () => {
        setColor(colorThemes[currentIndex].id);
    };

    const getVisibleThemes = () => {
        const total = colorThemes.length;
        const items = [];
        for (let i = -2; i <= 2; i++) {
            const index = (currentIndex + i + total) % total;
            items.push({ ...colorThemes[index], offset: i });
        }
        return items;
    };

    if (!isOpen) return null;

    const currentTheme = colorThemes[currentIndex];
    const isCurrentSelected = theme.color === currentTheme.id;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Carousel Container */}
            <div
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className="fixed left-1/2 z-50 outline-none"
                style={{
                    top: "70px",
                    transform: "translateX(-50%)",
                    animation: "fadeInDown 0.2s ease-out"
                }}
            >
                <style>{`
                    @keyframes fadeInDown {
                        from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                        to { opacity: 1; transform: translateX(-50%) translateY(0); }
                    }
                `}</style>

                <div
                    className="rounded-3xl overflow-hidden shadow-2xl"
                    style={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        width: "450px",
                        maxWidth: "90vw",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-center"
                        style={{
                            padding: "16px 24px",
                            borderBottom: "1px solid var(--border)"
                        }}
                    >
                        <h3
                            className="text-base font-semibold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            {t.settings.colorTheme}
                        </h3>
                    </div>

                    {/* Carousel */}
                    <div
                        className="relative flex items-center justify-center"
                        style={{ padding: "32px 16px" }}
                    >
                        {/* Left Arrow */}
                        <button
                            onClick={goToPrev}
                            className="absolute left-4 z-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "var(--bg-tertiary)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <ChevronLeft size={24} />
                        </button>

                        {/* Cards Container */}
                        <div
                            className="flex items-center justify-center"
                            style={{ gap: "12px", overflow: "hidden" }}
                        >
                            {getVisibleThemes().map((ct) => {
                                const isCenter = ct.offset === 0;
                                const scale = isCenter ? 1 : 0.7;
                                const opacity = isCenter ? 1 : 0.5;
                                const zIndex = isCenter ? 10 : 5 - Math.abs(ct.offset);

                                return (
                                    <div
                                        key={`${ct.id}-${ct.offset}`}
                                        className="flex flex-col items-center transition-all duration-300"
                                        style={{
                                            transform: `scale(${scale})`,
                                            opacity,
                                            zIndex,
                                        }}
                                    >
                                        <div
                                            className="rounded-2xl flex items-center justify-center shadow-xl"
                                            style={{
                                                backgroundColor: ct.color,
                                                width: isCenter ? "100px" : "70px",
                                                height: isCenter ? "100px" : "70px",
                                                border: isCenter && isCurrentSelected ? "3px solid white" : "none",
                                                boxShadow: isCenter ? `0 8px 32px ${ct.color}60` : undefined,
                                            }}
                                        >
                                            {isCenter && isCurrentSelected && (
                                                <Check size={32} className="text-white" strokeWidth={3} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={goToNext}
                            className="absolute right-4 z-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{
                                width: "40px",
                                height: "40px",
                                backgroundColor: "var(--bg-tertiary)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Theme Name - Enhanced styling */}
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: "100%",
                            padding: "8px 24px 24px 24px",
                        }}
                    >
                        <span
                            className="text-center transition-all duration-300"
                            style={{
                                color: currentTheme.color,
                                fontSize: "20px",
                                fontWeight: 700,
                                letterSpacing: "0.5px",
                                whiteSpace: "nowrap",
                                textShadow: `0 2px 8px ${currentTheme.color}40`,
                            }}
                        >
                            {t.themes[currentTheme.id] || currentTheme.label}
                        </span>
                    </div>

                    {/* Dots Indicator */}
                    <div
                        className="flex items-center justify-center"
                        style={{ paddingBottom: "20px", gap: "6px" }}
                    >
                        {colorThemes.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className="rounded-full transition-all"
                                style={{
                                    width: idx === currentIndex ? "20px" : "8px",
                                    height: "8px",
                                    backgroundColor: idx === currentIndex ? colorThemes[currentIndex].color : "var(--border)",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
