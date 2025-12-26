'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown, Copy } from 'lucide-react';
import { useLanguage } from '@/contexts';

interface JsonTreeProps {
    data: string;
    expandAll?: boolean | null;
    treeKey?: number;
}

interface TreeNodeProps {
    name: string;
    value: unknown;
    level: number;
    isLast: boolean;
    forceExpand: boolean | null;
    onContextMenu: (e: React.MouseEvent, value: unknown) => void;
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

function TreeNode({ name, value, level, isLast, forceExpand, onContextMenu }: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(level < 2);
    const type = getValueType(value);
    const isExpandable = type === 'object' || type === 'array';

    // React to forceExpand changes
    useEffect(() => {
        if (forceExpand !== null) {
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
                onClick={() => isExpandable && setIsExpanded(!isExpanded)}
                onContextMenu={handleContextMenu}
            >
                {isExpandable ? (
                    <span className="tree-toggle">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                ) : (
                    <span className="tree-toggle-spacer" />
                )}

                <span className="tree-key">{name}</span>
                <span className="tree-colon">:</span>

                {!isExpandable ? (
                    <span className={`tree-value tree-value-${type}`}>
                        {getValuePreview(value, type)}
                    </span>
                ) : (
                    <span className="tree-bracket">
                        {type === 'array' ? '[' : '{'}
                        {!isExpanded && (
                            <>
                                <span className="tree-preview">{children.length} items</span>
                                {type === 'array' ? ']' : '}'}
                            </>
                        )}
                    </span>
                )}
            </div>

            {isExpandable && isExpanded && (
                <div className="tree-children">
                    {children.map((child, index) => (
                        <TreeNode
                            key={child.key}
                            name={child.key}
                            value={child.value}
                            level={level + 1}
                            isLast={index === children.length - 1}
                            forceExpand={forceExpand}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                    <div className="tree-bracket-close">
                        {type === 'array' ? ']' : '}'}
                    </div>
                </div>
            )}
        </div>
    );
}

export function JsonTree({ data, expandAll = null, treeKey = 0 }: JsonTreeProps) {
    const { t } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        value: null
    });

    useEffect(() => {
        setMounted(true);
    }, []);
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
                <span>Paste or type JSON to view tree...</span>
            </div>
        );
    }

    if (parsedData === null) {
        return (
            <div className="tree-container tree-error">
                <span>Invalid JSON - fix errors to view tree</span>
            </div>
        );
    }

    const rootType = getValueType(parsedData);

    return (
        <div className="tree-container">
            <div className="tree-root" key={treeKey}>
                {rootType === 'object' || rootType === 'array' ? (
                    <TreeNode
                        name="root"
                        value={parsedData}
                        level={0}
                        isLast={true}
                        forceExpand={expandAll}
                        onContextMenu={handleContextMenu}
                    />
                ) : (
                    <div className="tree-node" onContextMenu={(e) => {
                        e.preventDefault();
                        handleContextMenu(e, parsedData);
                    }}>
                        <span className="tree-key">value</span>
                        <span className="tree-colon">:</span>
                        <span className={`tree-value tree-value-${rootType}`}>
                            {getValuePreview(parsedData, rootType)}
                        </span>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            {/* Context Menu */}
            {mounted && contextMenu.visible && createPortal(
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
