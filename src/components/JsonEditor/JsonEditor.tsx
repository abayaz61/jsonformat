'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Editor, { OnMount, OnChange, Monaco } from '@monaco-editor/react';
import { useTheme, useSettings, useLanguage } from '@/contexts';
import type { JsonValidationResult } from '@/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { editor } from 'monaco-editor';
import { defineMonacoTheme, getSyntaxColors } from '@/utils/monacoTheme';

interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    validation: JsonValidationResult;
}

type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

interface KeyDecorationSpec {
    start: number;
    end: number;
    type: JsonValueType;
}

interface ParseResult {
    type: JsonValueType;
    end: number;
}

function skipWhitespace(source: string, index: number): number {
    let cursor = index;
    while (cursor < source.length && /\s/.test(source[cursor])) {
        cursor++;
    }
    return cursor;
}

function findStringEnd(source: string, start: number): number {
    let cursor = start + 1;
    while (cursor < source.length) {
        if (source[cursor] === '\\') {
            cursor += 2;
            continue;
        }
        if (source[cursor] === '"') {
            return cursor;
        }
        cursor++;
    }
    return -1;
}

function findNumberEnd(source: string, start: number): number {
    let cursor = start;

    if (source[cursor] === '-') cursor++;
    if (cursor >= source.length || !/\d/.test(source[cursor])) return -1;

    while (cursor < source.length && /\d/.test(source[cursor])) cursor++;

    if (source[cursor] === '.') {
        cursor++;
        if (cursor >= source.length || !/\d/.test(source[cursor])) return -1;
        while (cursor < source.length && /\d/.test(source[cursor])) cursor++;
    }

    if (source[cursor] === 'e' || source[cursor] === 'E') {
        cursor++;
        if (source[cursor] === '+' || source[cursor] === '-') cursor++;
        if (cursor >= source.length || !/\d/.test(source[cursor])) return -1;
        while (cursor < source.length && /\d/.test(source[cursor])) cursor++;
    }

    return cursor - 1;
}

function matchLiteral(source: string, index: number, literal: 'true' | 'false' | 'null'): number {
    return source.slice(index, index + literal.length) === literal ? index + literal.length : -1;
}

function collectJsonKeyDecorations(source: string): KeyDecorationSpec[] {
    const decorations: KeyDecorationSpec[] = [];

    const parseValue = (index: number): ParseResult | null => {
        const cursor = skipWhitespace(source, index);
        if (cursor >= source.length) return null;

        const current = source[cursor];

        if (current === '"') {
            const end = findStringEnd(source, cursor);
            return end === -1 ? null : { type: 'string', end: end + 1 };
        }

        if (current === '{') {
            return parseObject(cursor);
        }

        if (current === '[') {
            return parseArray(cursor);
        }

        if (current === 't') {
            const end = matchLiteral(source, cursor, 'true');
            return end === -1 ? null : { type: 'boolean', end };
        }

        if (current === 'f') {
            const end = matchLiteral(source, cursor, 'false');
            return end === -1 ? null : { type: 'boolean', end };
        }

        if (current === 'n') {
            const end = matchLiteral(source, cursor, 'null');
            return end === -1 ? null : { type: 'null', end };
        }

        const numberEnd = findNumberEnd(source, cursor);
        return numberEnd === -1 ? null : { type: 'number', end: numberEnd + 1 };
    };

    const parseObject = (index: number): ParseResult | null => {
        let cursor = index + 1;

        while (cursor < source.length) {
            cursor = skipWhitespace(source, cursor);
            if (source[cursor] === '}') {
                return { type: 'object', end: cursor + 1 };
            }

            if (source[cursor] !== '"') return null;
            const keyStart = cursor;
            const keyEnd = findStringEnd(source, cursor);
            if (keyEnd === -1) return null;

            cursor = skipWhitespace(source, keyEnd + 1);
            if (source[cursor] !== ':') return null;

            const valueResult = parseValue(cursor + 1);
            if (!valueResult) return null;

            decorations.push({
                start: keyStart,
                end: keyEnd + 1,
                type: valueResult.type,
            });

            cursor = skipWhitespace(source, valueResult.end);
            if (source[cursor] === ',') {
                cursor++;
                continue;
            }

            if (source[cursor] === '}') {
                return { type: 'object', end: cursor + 1 };
            }

            return null;
        }

        return null;
    };

    const parseArray = (index: number): ParseResult | null => {
        let cursor = index + 1;

        while (cursor < source.length) {
            cursor = skipWhitespace(source, cursor);
            if (source[cursor] === ']') {
                return { type: 'array', end: cursor + 1 };
            }

            const valueResult = parseValue(cursor);
            if (!valueResult) return null;

            cursor = skipWhitespace(source, valueResult.end);
            if (source[cursor] === ',') {
                cursor++;
                continue;
            }

            if (source[cursor] === ']') {
                return { type: 'array', end: cursor + 1 };
            }

            return null;
        }

        return null;
    };

    const root = parseValue(0);
    return root ? decorations : [];
}

export function JsonEditor({ value, onChange, validation }: JsonEditorProps) {
    const { theme } = useTheme();
    const { settings } = useSettings();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(true);
    const [currentThemeName, setCurrentThemeName] = useState<string>('vs-dark');
    const monacoRef = useRef<Monaco | null>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const keyDecorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);
    const syntaxColors = useMemo(
        () => getSyntaxColors(theme.color, theme.mode),
        [theme.color, theme.mode]
    );
    const syntaxColorVars = useMemo<React.CSSProperties>(() => ({
        ['--json-key-string' as string]: syntaxColors.string,
        ['--json-key-number' as string]: syntaxColors.number,
        ['--json-key-boolean' as string]: syntaxColors.boolean,
        ['--json-key-null' as string]: syntaxColors.nullValue,
        ['--json-key-object' as string]: syntaxColors.object,
        ['--json-key-array' as string]: syntaxColors.array,
    }), [syntaxColors]);

    const handleEditorMount: OnMount = (editor, monaco) => {
        setIsLoading(false);
        monacoRef.current = monaco;
        editorRef.current = editor;
        keyDecorationsRef.current = editor.createDecorationsCollection();

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

    useEffect(() => {
        if (!editorRef.current || !monacoRef.current) return;

        const model = editorRef.current.getModel();
        if (!model || !validation.valid || !value.trim()) {
            keyDecorationsRef.current?.set([]);
            return;
        }

        const keyDecorations = collectJsonKeyDecorations(value).map((item) => ({
            range: new monacoRef.current!.Range(
                model.getPositionAt(item.start).lineNumber,
                model.getPositionAt(item.start).column,
                model.getPositionAt(item.end).lineNumber,
                model.getPositionAt(item.end).column
            ),
            options: {
                inlineClassName: `json-editor-key json-editor-key-${item.type}`,
            },
        }));

        keyDecorationsRef.current?.set(keyDecorations);
    }, [value, validation.valid, theme.color, theme.mode]);

    useEffect(() => {
        return () => {
            keyDecorationsRef.current?.clear();
        };
    }, []);

    const handleChange: OnChange = (newValue) => {
        onChange(newValue || '');
    };

    return (
        <div className="editor-container" style={syntaxColorVars}>
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
