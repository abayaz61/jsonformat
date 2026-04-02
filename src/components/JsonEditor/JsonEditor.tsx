'use client';

import React, { useEffect, useState, useRef } from 'react';
import Editor, { OnMount, OnChange, Monaco } from '@monaco-editor/react';
import { useTheme, useSettings, useLanguage } from '@/contexts';
import type { JsonValidationResult } from '@/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { editor } from 'monaco-editor';
import { defineMonacoTheme } from '@/utils/monacoTheme';

interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    validation: JsonValidationResult;
}

export function JsonEditor({ value, onChange, validation }: JsonEditorProps) {
    const { theme } = useTheme();
    const { settings } = useSettings();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [currentThemeName, setCurrentThemeName] = useState<string>('vs-dark');
    const monacoRef = useRef<Monaco | null>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorMount: OnMount = (editor, monaco) => {
        setIsLoading(false);
        monacoRef.current = monaco;
        editorRef.current = editor;

        // Configure JSON language defaults
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            allowComments: false,
            trailingCommas: 'error'
        });

        // Define and apply initial custom theme
        const themeName = defineMonacoTheme(monaco, theme.color, theme.mode);
        monaco.editor.setTheme(themeName);
        setCurrentThemeName(themeName);
    };

    // Update theme when color or mode changes
    useEffect(() => {
        if (monacoRef.current && editorRef.current) {
            const themeName = defineMonacoTheme(monacoRef.current, theme.color, theme.mode);
            monacoRef.current.editor.setTheme(themeName);
            setCurrentThemeName(themeName);
        }
    }, [theme.color, theme.mode]);

    const handleChange: OnChange = (newValue) => {
        onChange(newValue || '');
    };

    return (
        <div className="editor-container">
            {/* Status Bar */}
            <div className="editor-status">
                {value.trim() === '' ? (
                    <span className="status-empty">{t.editor.pasteOrType}</span>
                ) : validation.valid ? (
                    <span className="status-valid">
                        <CheckCircle2 size={14} />
                        {t.editor.validJson}
                    </span>
                ) : (
                    <span className="status-invalid">
                        <AlertCircle size={14} />
                        {validation.error}
                        {validation.line && ` (Line ${validation.line})`}
                    </span>
                )}
            </div>

            {/* Editor */}
            <div className="editor-wrapper">
                {isLoading && (
                    <div className="editor-loading">
                        <div className="loading-spinner" />
                    </div>
                )}
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={value}
                    onChange={handleChange}
                    onMount={handleEditorMount}
                    theme={currentThemeName}
                    options={{
                        fontSize: settings.fontSize,
                        tabSize: settings.indentSize,
                        wordWrap: settings.wordWrap ? 'on' : 'off',
                        lineNumbers: settings.lineNumbers ? 'on' : 'off',
                        minimap: { enabled: settings.minimap },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        formatOnPaste: false,
                        formatOnType: false,
                        folding: true,
                        foldingStrategy: 'indentation',
                        renderLineHighlight: 'line',
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        padding: { top: 16, bottom: 16 },
                        fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
                        fontLigatures: true,
                        bracketPairColorization: { enabled: true },
                        guides: {
                            bracketPairs: true,
                            indentation: true
                        }
                    }}
                    loading={null}
                />
            </div>
        </div>
    );
}
