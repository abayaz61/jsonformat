'use client';

import React, { useRef } from 'react';
import { useTheme, useLanguage } from '@/contexts';
import { ColorPaletteCarousel } from './ColorPaletteCarousel';
import type { FormatOptions } from '@/utils/jsonOperations';
import {
    Moon,
    Sun,
    Globe,
    Maximize2,
    Minimize2,
    Palette,
    Wand2,
    SlidersHorizontal,
    Copy,
    ClipboardPaste,
    Download,
    Upload,
    Trash2,
    FileCode2
} from 'lucide-react';

interface HeaderProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onFormat: () => void;
    onMinify: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onDownload: () => void;
    onUpload: (file: File) => void;
    onClear: () => void;
    onExport: () => void;
    formatOptions: FormatOptions & { autoFormat: boolean };
    onToggleFormatOption: (key: string) => void;
    disabled?: boolean;
}


export function Header({
    isFullscreen,
    onToggleFullscreen,
    onFormat,
    onMinify,
    onCopy,
    onPaste,
    onDownload,
    onUpload,
    onClear,
    onExport,
    formatOptions,
    onToggleFormatOption,
    disabled = false
}: HeaderProps) {
    const { theme, toggleMode } = useTheme();
    const { t, language, setLanguage, availableLanguages } = useLanguage();
    const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);
    const [showColorMenu, setShowColorMenu] = React.useState(false);
    const [showFormatOptions, setShowFormatOptions] = React.useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const hasActiveFilters = formatOptions.ignoreNull || formatOptions.ignoreDefaultDates || formatOptions.ignoreZeros || formatOptions.ignoreEmptyArrays || formatOptions.convertDotNetDates || formatOptions.autoFormat;

    const formatOptionItems = [
        { key: 'autoFormat', label: t.toolbar.autoFormat, active: formatOptions.autoFormat },
        { key: 'ignoreNull', label: t.toolbar.ignoreNull, active: !!formatOptions.ignoreNull },
        { key: 'ignoreDefaultDates', label: t.toolbar.ignoreDefaultDates, active: !!formatOptions.ignoreDefaultDates },
        { key: 'ignoreZeros', label: t.toolbar.ignoreZeros, active: !!formatOptions.ignoreZeros },
        { key: 'ignoreEmptyArrays', label: t.toolbar.ignoreEmptyArrays, active: !!formatOptions.ignoreEmptyArrays },
        { key: 'convertDotNetDates', label: t.toolbar.convertDotNetDates, active: !!formatOptions.convertDotNetDates },
    ];

    return (
        <header className="header">
            {/* Logo */}
            <div className="header-logo">
                <span className="header-logo-icon">{'{ }'}</span>
                <h1 className="header-title">{t.header.title}</h1>
                {process.env.NEXT_PUBLIC_APP_VERSION ? (
                    <span className="header-version">v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
                ) : null}
            </div>

            {/* Toolbar Actions */}
            <div className="header-actions">
                <button
                    className="header-action-btn primary"
                    onClick={onFormat}
                    disabled={disabled}
                    title={t.toolbar.format}
                >
                    <Wand2 size={16} />
                </button>

                {/* Format Options */}
                <div className="header-dropdown">
                    <button
                        className={`header-action-btn ${hasActiveFilters ? 'active' : ''}`}
                        onClick={() => setShowFormatOptions(!showFormatOptions)}
                        title={t.toolbar.formatOptions}
                    >
                        <SlidersHorizontal size={16} />
                    </button>
                    {showFormatOptions && (
                        <>
                            <div className="dropdown-backdrop" onClick={() => setShowFormatOptions(false)} />
                            <div className="dropdown-menu format-options-menu">
                                <div className="format-options-title">{t.toolbar.formatOptions}</div>
                                {formatOptionItems.map((item) => (
                                    <button
                                        key={item.key}
                                        className="format-option-item"
                                        onClick={() => onToggleFormatOption(item.key)}
                                    >
                                        <span className="format-option-label">{item.label}</span>
                                        <span className={`format-option-toggle ${item.active ? 'active' : ''}`}>
                                            <span className="format-option-toggle-thumb" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button
                    className="header-action-btn"
                    onClick={onMinify}
                    disabled={disabled}
                    title={t.toolbar.minify}
                >
                    <Minimize2 size={16} />
                </button>

                <div className="header-separator" />

                <button
                    className="header-action-btn"
                    onClick={onCopy}
                    disabled={disabled}
                    title={t.toolbar.copy}
                >
                    <Copy size={16} />
                </button>
                <button
                    className="header-action-btn"
                    onClick={onPaste}
                    title={t.toolbar.paste}
                >
                    <ClipboardPaste size={16} />
                </button>

                <div className="header-separator" />

                <button
                    className="header-action-btn"
                    onClick={onDownload}
                    disabled={disabled}
                    title={t.toolbar.download}
                >
                    <Download size={16} />
                </button>
                <button
                    className="header-action-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title={t.toolbar.upload}
                >
                    <Upload size={16} />
                </button>
                <button
                    className="header-action-btn"
                    onClick={onExport}
                    disabled={disabled}
                    title={t.toolbar.export}
                >
                    <FileCode2 size={16} />
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json,text/plain"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <div className="header-separator" />

                <button
                    className="header-action-btn danger"
                    onClick={onClear}
                    disabled={disabled}
                    title={t.toolbar.clear}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Settings */}
            <div className="header-settings">
                {/* Color Theme */}
                <button
                    className="header-button"
                    onClick={() => setShowColorMenu(!showColorMenu)}
                    title={t.settings.colorTheme}
                >
                    <Palette size={18} />
                </button>
                <ColorPaletteCarousel
                    isOpen={showColorMenu}
                    onClose={() => setShowColorMenu(false)}
                />

                {/* Theme Toggle */}
                <button
                    className="header-button"
                    onClick={toggleMode}
                    title={theme.mode === 'dark' ? t.themes.light : t.themes.dark}
                >
                    {theme.mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Language */}
                <div className="header-dropdown">
                    <button
                        className="header-button"
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        title={t.settings.language}
                    >
                        <Globe size={18} />
                    </button>
                    {showLanguageMenu && (
                        <>
                            <div className="dropdown-backdrop" onClick={() => setShowLanguageMenu(false)} />
                            <div className="dropdown-menu">
                                {availableLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        className={`dropdown-item ${language === lang.code ? 'active' : ''}`}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setShowLanguageMenu(false);
                                        }}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Fullscreen */}
                <button
                    className="header-button"
                    onClick={onToggleFullscreen}
                    title={isFullscreen ? t.toolbar.exitFullscreen : t.toolbar.fullscreen}
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>
        </header>
    );
}
