'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { useLanguage, useTheme } from '@/contexts';
import { getSyntaxColors, type SyntaxColors } from '@/utils/monacoTheme';
import { formatJwtPayloadTooltip } from '@/utils/jwt';

interface JsonTreeProps {
    data: string;
    expandAll?: boolean | null;
    treeKey?: number;
}

interface TreeNodeProps {
    name: string;
    value: unknown;
    level: number;
    forceExpand: boolean | null;
    onContextMenu: (e: React.MouseEvent, value: unknown) => void;
    items: string;
    colors: SyntaxColors;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    value: unknown;
}

function getValueType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

function getValuePreview(value: unknown, type: string): string {
    switch (type) {
        case 'string':
            return `"${value}"`;
        case 'number':
        case 'boolean':
            return String(value);
        case 'null':
            return 'null';
        case 'array':
            return `Array(${(value as unknown[]).length})`;
        case 'object':
            return `{${Object.keys(value as object).length} keys}`;
        default:
            return String(value);
    }
}

function getTypeColor(type: string, colors: SyntaxColors): string {
    switch (type) {
        case 'string':
            return colors.string;
        case 'number':
            return colors.number;
        case 'boolean':
            return colors.boolean;
        case 'null':
            return colors.nullValue;
        case 'object':
            return colors.object;
        case 'array':
            return colors.array;
        default:
            return colors.accent;
    }
}

function handleValueSelect(e: React.MouseEvent<HTMLSpanElement>) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    const selection = window.getSelection();
    if (!selection || !target) return;

    selection.removeAllRanges();
    const range = document.createRange();
    const text = target.textContent || '';

    // If text is wrapped in quotes (e.g. "15708555:00045FC3"), select inner string value excluding quotes
    if (text.startsWith('"') && text.endsWith('"') && text.length >= 2 && target.firstChild) {
        try {
            range.setStart(target.firstChild, 1);
            range.setEnd(target.firstChild, text.length - 1);
        } catch {
            range.selectNodeContents(target);
        }
    } else {
        range.selectNodeContents(target);
    }

    selection.addRange(range);
}

function TreeNode({ name, value, level, forceExpand, onContextMenu, items, colors }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(forceExpand ?? level < 2);
    const type = getValueType(value);
    const isExpandable = type === 'object' || type === 'array';
    const typeColor = getTypeColor(type, colors);
    const jwtTooltip = type === 'string' && typeof value === 'string'
        ? formatJwtPayloadTooltip(value)
        : null;

    useEffect(() => {
        if (forceExpand !== null && forceExpand !== undefined) {
            setIsExpanded(forceExpand);
        }
    }, [forceExpand]);

    const children = useMemo(() => {
        if (!isExpandable) return [];
        if (type === 'array') {
            return (value as unknown[]).map((item, index) => ({
                key: String(index),
                value: item
            }));
        }
        return Object.entries(value as object).map(([key, val]) => ({
            key,
            value: val
        }));
    }, [value, type, isExpandable]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, value);
    };

    return (
        <div className="tree-node">
            <div
                className={`tree-node-content ${isExpandable ? 'expandable' : ''}`}
                onClick={() => isExpandable && setIsExpanded((prev) => !prev)}
                onContextMenu={handleContextMenu}
            >
                {isExpandable ? (
                    <span className="tree-toggle">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                ) : (
                    <span className="tree-toggle-spacer" />
                )}

                <span
                    className="tree-key"
                    style={{ color: colors.property }}
                    onClick={handleValueSelect}
                    onMouseDown={handleValueSelect}
                    onDoubleClick={handleValueSelect}
                >
                    {name}
                </span>
                <span className="tree-colon" style={{ color: colors.bracket }}>:</span>

                {!isExpandable ? (
                    type === 'string' ? (
                        <span
                            className="tree-value tree-value-string"
                            style={{ color: typeColor }}
                            title={jwtTooltip ?? undefined}
                            onClick={handleValueSelect}
                            onMouseDown={handleValueSelect}
                            onDoubleClick={handleValueSelect}
                        >
                            <span className="tree-quote">"</span>
                            <span className="tree-val-content">{String(value)}</span>
                            <span className="tree-quote">"</span>
                        </span>
                    ) : (
                        <span
                            className={`tree-value tree-value-${type}`}
                            style={{ color: typeColor, fontStyle: type === 'null' ? 'italic' : undefined }}
                            title={jwtTooltip ?? undefined}
                            onClick={handleValueSelect}
                            onMouseDown={handleValueSelect}
                            onDoubleClick={handleValueSelect}
                        >
                            {getValuePreview(value, type)}
                        </span>
                    )
                ) : (
                    <span className="tree-bracket" style={{ color: typeColor }}>
                        {type === 'array' ? '[' : '{'}
                        {!isExpanded && (
                            <>
                                <span className="tree-preview" style={{ color: colors.preview }}>
                                    {children.length} {items}
                                </span>
                                {type === 'array' ? ']' : '}'}
                            </>
                        )}
                    </span>
                )}
            </div>

            {isExpandable && isExpanded && (
                <div className="tree-children">
                    {children.map((child) => (
                        <TreeNode
                            key={child.key}
                            name={child.key}
                            value={child.value}
                            level={level + 1}
                            forceExpand={forceExpand}
                            onContextMenu={onContextMenu}
                            items={items}
                            colors={colors}
                        />
                    ))}
                    <div className="tree-bracket-close" style={{ color: typeColor }}>
                        {type === 'array' ? ']' : '}'}
                    </div>
                </div>
            )}
        </div>
    );
}

export function JsonTree({ data, expandAll = null, treeKey = 0 }: JsonTreeProps) {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        value: null
    });
    const canUsePortal = typeof document !== 'undefined';
    const syntaxColors = useMemo(
        () => getSyntaxColors(theme.color, theme.mode),
        [theme.color, theme.mode]
    );
    const parsedData = useMemo(() => {
        if (!data.trim()) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    }, [data]);

    const handleContextMenu = useCallback((e: React.MouseEvent, value: unknown) => {
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            value
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(prev => ({ ...prev, visible: false }));
    }, []);

    const handleCopy = useCallback(async () => {
        if (contextMenu.value !== null && contextMenu.value !== undefined) {
            const textToCopy = typeof contextMenu.value === 'string'
                ? contextMenu.value
                : JSON.stringify(contextMenu.value, null, 2);
            await navigator.clipboard.writeText(textToCopy);
        }
        closeContextMenu();
    }, [contextMenu.value, closeContextMenu]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClick = () => closeContextMenu();
        const handleScroll = () => closeContextMenu();

        if (contextMenu.visible) {
            document.addEventListener('click', handleClick);
            document.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [contextMenu.visible, closeContextMenu]);

    if (!data.trim()) {
        return (
            <div className="tree-container tree-empty">
                <span>{t.editor.pasteToView}</span>
            </div>
        );
    }

    if (parsedData === null) {
        return (
            <div className="tree-container tree-error">
                <span>{t.editor.invalidJsonFix}</span>
            </div>
        );
    }

    const rootType = getValueType(parsedData);
    const rootJwtTooltip = rootType === 'string' && typeof parsedData === 'string'
        ? formatJwtPayloadTooltip(parsedData)
        : null;

    return (
        <div className="tree-container">
            <div className="tree-root" key={treeKey}>
                {rootType === 'object' || rootType === 'array' ? (
                    <TreeNode
                        name="root"
                        value={parsedData}
                        level={0}
                        forceExpand={expandAll}
                        onContextMenu={handleContextMenu}
                        items={t.editor.items}
                        colors={syntaxColors}
                    />
                ) : (
                    <div className="tree-node" onContextMenu={(e) => {
                        e.preventDefault();
                        handleContextMenu(e, parsedData);
                    }}>
                        <span
                            className="tree-key"
                            style={{ color: syntaxColors.property }}
                            onClick={handleValueSelect}
                            onMouseDown={handleValueSelect}
                            onDoubleClick={handleValueSelect}
                        >
                            value
                        </span>
                        <span className="tree-colon" style={{ color: syntaxColors.bracket }}>:</span>
                        {rootType === 'string' ? (
                            <span
                                className="tree-value tree-value-string"
                                style={{ color: getTypeColor(rootType, syntaxColors) }}
                                title={rootJwtTooltip ?? undefined}
                                onClick={handleValueSelect}
                                onMouseDown={handleValueSelect}
                                onDoubleClick={handleValueSelect}
                            >
                                <span className="tree-quote">"</span>
                                <span className="tree-val-content">{String(parsedData)}</span>
                                <span className="tree-quote">"</span>
                            </span>
                        ) : (
                            <span
                                className={`tree-value tree-value-${rootType}`}
                                style={{
                                    color: getTypeColor(rootType, syntaxColors),
                                    fontStyle: rootType === 'null' ? 'italic' : undefined
                                }}
                                title={rootJwtTooltip ?? undefined}
                                onClick={handleValueSelect}
                                onMouseDown={handleValueSelect}
                                onDoubleClick={handleValueSelect}
                            >
                                {getValuePreview(parsedData, rootType)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {canUsePortal && contextMenu.visible && createPortal(
                (() => {
                    const menuHeight = 44;
                    const menuWidth = 130;
                    const x = Math.min(contextMenu.x, window.innerWidth - menuWidth - 10);
                    const y = contextMenu.y + menuHeight > window.innerHeight
                        ? contextMenu.y - menuHeight
                        : contextMenu.y;

                    return (
                        <div
                            className="tree-context-menu"
                            style={{
                                position: 'fixed',
                                left: x,
                                top: y,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="tree-context-menu-item" onClick={handleCopy}>
                                <Copy size={14} />
                                <span>{t.toolbar.copy}</span>
                            </button>
                        </div>
                    );
                })(),
                document.body
            )}
        </div>
    );
}
