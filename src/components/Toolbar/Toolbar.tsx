'use client';

import React, { useRef } from 'react';
import { useLanguage } from '@/contexts';
import {
    Wand2,
    Minimize2,
    Copy,
    ClipboardPaste,
    Download,
    Upload,
    Trash2
} from 'lucide-react';

interface ToolbarProps {
    onFormat: () => void;
    onMinify: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onDownload: () => void;
    onUpload: (file: File) => void;
    onClear: () => void;
    disabled?: boolean;
}

export function Toolbar({
    onFormat,
    onMinify,
    onCopy,
    onPaste,
    onDownload,
    onUpload,
    onClear,
    disabled = false
}: ToolbarProps) {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="toolbar">
            <div className="toolbar-group">
                <button
                    className="toolbar-button primary"
                    onClick={onFormat}
                    disabled={disabled}
                    title={t.toolbar.format}
                >
                    <Wand2 size={16} />
                    <span>{t.toolbar.format}</span>
                </button>

                <button
                    className="toolbar-button"
                    onClick={onMinify}
                    disabled={disabled}
                    title={t.toolbar.minify}
                >
                    <Minimize2 size={16} />
                    <span>{t.toolbar.minify}</span>
                </button>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
                <button
                    className="toolbar-button"
                    onClick={onCopy}
                    disabled={disabled}
                    title={t.toolbar.copy}
                >
                    <Copy size={16} />
                    <span>{t.toolbar.copy}</span>
                </button>

                <button
                    className="toolbar-button"
                    onClick={onPaste}
                    title={t.toolbar.paste}
                >
                    <ClipboardPaste size={16} />
                    <span>{t.toolbar.paste}</span>
                </button>
            </div>

            <div className="toolbar-separator" />

            <div className="toolbar-group">
                <button
                    className="toolbar-button"
                    onClick={onDownload}
                    disabled={disabled}
                    title={t.toolbar.download}
                >
                    <Download size={16} />
                    <span>{t.toolbar.download}</span>
                </button>

                <button
                    className="toolbar-button"
                    onClick={() => fileInputRef.current?.click()}
                    title={t.toolbar.upload}
                >
                    <Upload size={16} />
                    <span>{t.toolbar.upload}</span>
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json,text/plain"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="toolbar-spacer" />

            <div className="toolbar-group">
                <button
                    className="toolbar-button danger"
                    onClick={onClear}
                    disabled={disabled}
                    title={t.toolbar.clear}
                >
                    <Trash2 size={16} />
                    <span>{t.toolbar.clear}</span>
                </button>
            </div>
        </div>
    );
}
