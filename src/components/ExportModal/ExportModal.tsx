'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    jsonData: string;
}

type ExportLanguage = 'typescript' | 'python' | 'java' | 'csharp' | 'go' | 'rust';

const languages: { id: ExportLanguage; name: string; extension: string }[] = [
    { id: 'typescript', name: 'TypeScript', extension: 'ts' },
    { id: 'python', name: 'Python', extension: 'py' },
    { id: 'java', name: 'Java', extension: 'java' },
    { id: 'csharp', name: 'C#', extension: 'cs' },
    { id: 'go', name: 'Go', extension: 'go' },
    { id: 'rust', name: 'Rust', extension: 'rs' },
];

function inferType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) {
        if (value.length === 0) return 'any[]';
        return `${inferType(value[0])}[]`;
    }
    return typeof value;
}

function generateTypeScript(data: unknown, name: string = 'Root'): string {
    if (typeof data !== 'object' || data === null) {
        return `type ${name} = ${inferType(data)};`;
    }

    if (Array.isArray(data)) {
        if (data.length === 0) return `type ${name} = any[];`;
        if (typeof data[0] === 'object' && data[0] !== null) {
            return generateTypeScript(data[0], name + 'Item') + `\n\ntype ${name} = ${name}Item[];`;
        }
        return `type ${name} = ${inferType(data[0])}[];`;
    }

    const lines: string[] = [`interface ${name} {`];
    for (const [key, value] of Object.entries(data)) {
        const safeKey = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : `"${key}"`;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            lines.push(`  ${safeKey}: ${key.charAt(0).toUpperCase() + key.slice(1)};`);
        } else {
            lines.push(`  ${safeKey}: ${inferType(value)};`);
        }
    }
    lines.push('}');

    let result = '';
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result += generateTypeScript(value, key.charAt(0).toUpperCase() + key.slice(1)) + '\n\n';
        }
    }
    result += lines.join('\n');
    return result;
}

function generatePython(data: unknown, name: string = 'Root'): string {
    // Handle arrays by extracting first element
    if (Array.isArray(data)) {
        if (data.length === 0) return '# Empty array - cannot generate model';
        if (typeof data[0] === 'object' && data[0] !== null) {
            return generatePython(data[0], name) + '\n\n# Usage: List[' + name + ']';
        }
        return `# ${name}: List[${pythonType(data[0])}]`;
    }

    if (typeof data !== 'object' || data === null) {
        return `# ${name}: ${inferType(data)}`;
    }

    const lines: string[] = [
        'from dataclasses import dataclass',
        'from typing import Optional, List, Any',
        '',
    ];

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const className = key.charAt(0).toUpperCase() + key.slice(1);
            lines.push('@dataclass');
            lines.push(`class ${className}:`);
            for (const [k, v] of Object.entries(value)) {
                lines.push(`    ${k}: ${pythonType(v)}`);
            }
            lines.push('');
        }
    }

    lines.push('@dataclass');
    lines.push(`class ${name}:`);
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            lines.push(`    ${key}: ${key.charAt(0).toUpperCase() + key.slice(1)}`);
        } else {
            lines.push(`    ${key}: ${pythonType(value)}`);
        }
    }

    return lines.join('\n');
}

function pythonType(value: unknown): string {
    if (value === null) return 'Optional[Any]';
    if (typeof value === 'string') return 'str';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float';
    if (typeof value === 'boolean') return 'bool';
    if (Array.isArray(value)) return `List[${value.length > 0 ? pythonType(value[0]) : 'Any'}]`;
    return 'Any';
}

function generateJava(data: unknown, name: string = 'Root'): string {
    // Handle arrays by extracting first element
    if (Array.isArray(data)) {
        if (data.length === 0) return '// Empty array - cannot generate model';
        if (typeof data[0] === 'object' && data[0] !== null) {
            return generateJava(data[0], name) + '\n\n// Usage: List<' + name + '>';
        }
        return `// ${name}: List<${javaType(data[0])}>`;
    }

    if (typeof data !== 'object' || data === null) {
        return `// ${name}: ${inferType(data)}`;
    }

    const lines: string[] = [`public class ${name} {`];
    for (const [key, value] of Object.entries(data)) {
        lines.push(`    private ${javaType(value, key)} ${key};`);
    }
    lines.push('');
    for (const [key, value] of Object.entries(data)) {
        const capKey = key.charAt(0).toUpperCase() + key.slice(1);
        const type = javaType(value, key);
        lines.push(`    public ${type} get${capKey}() { return ${key}; }`);
        lines.push(`    public void set${capKey}(${type} ${key}) { this.${key} = ${key}; }`);
    }
    lines.push('}');
    return lines.join('\n');
}

function javaType(value: unknown, key: string = ''): string {
    if (value === null) return 'Object';
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return `List<${value.length > 0 ? javaType(value[0]) : 'Object'}>`;
    if (typeof value === 'object') return key.charAt(0).toUpperCase() + key.slice(1);
    return 'Object';
}

function generateCSharp(data: unknown, name: string = 'Root'): string {
    // Handle arrays by extracting first element
    if (Array.isArray(data)) {
        if (data.length === 0) return '// Empty array - cannot generate model';
        if (typeof data[0] === 'object' && data[0] !== null) {
            return generateCSharp(data[0], name) + '\n\n// Usage: List<' + name + '>';
        }
        return `// ${name}: List<${csharpType(data[0])}>`;
    }

    if (typeof data !== 'object' || data === null) {
        return `// ${name}: ${inferType(data)}`;
    }

    const lines: string[] = [`public class ${name}`, '{'];
    for (const [key, value] of Object.entries(data)) {
        const propName = key.charAt(0).toUpperCase() + key.slice(1);
        lines.push(`    public ${csharpType(value, key)} ${propName} { get; set; }`);
    }
    lines.push('}');
    return lines.join('\n');
}

function csharpType(value: unknown, key: string = ''): string {
    if (value === null) return 'object?';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double';
    if (typeof value === 'boolean') return 'bool';
    if (Array.isArray(value)) return `List<${value.length > 0 ? csharpType(value[0]) : 'object'}>`;
    if (typeof value === 'object') return key.charAt(0).toUpperCase() + key.slice(1);
    return 'object';
}

function generateGo(data: unknown, name: string = 'Root'): string {
    // Handle arrays by extracting first element
    if (Array.isArray(data)) {
        if (data.length === 0) return '// Empty array - cannot generate model';
        if (typeof data[0] === 'object' && data[0] !== null) {
            return generateGo(data[0], name) + '\n\n// Usage: []' + name;
        }
        return `// ${name}: []${goType(data[0])}`;
    }

    if (typeof data !== 'object' || data === null) {
        return `// ${name}: ${inferType(data)}`;
    }

    const lines: string[] = [`type ${name} struct {`];
    for (const [key, value] of Object.entries(data)) {
        const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
        lines.push(`    ${fieldName} ${goType(value, key)} \`json:"${key}"\``);
    }
    lines.push('}');
    return lines.join('\n');
}

function goType(value: unknown, key: string = ''): string {
    if (value === null) return 'interface{}';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float64';
    if (typeof value === 'boolean') return 'bool';
    if (Array.isArray(value)) return `[]${value.length > 0 ? goType(value[0]) : 'interface{}'}`;
    if (typeof value === 'object') return key.charAt(0).toUpperCase() + key.slice(1);
    return 'interface{}';
}

function generateRust(data: unknown, name: string = 'Root'): string {
    // Handle arrays by extracting first element
    if (Array.isArray(data)) {
        if (data.length === 0) return '// Empty array - cannot generate model';
        if (typeof data[0] === 'object' && data[0] !== null) {
            return generateRust(data[0], name) + '\n\n// Usage: Vec<' + name + '>';
        }
        return `// ${name}: Vec<${rustType(data[0])}>`;
    }

    if (typeof data !== 'object' || data === null) {
        return `// ${name}: ${inferType(data)}`;
    }

    const lines: string[] = [
        'use serde::{Deserialize, Serialize};',
        '',
        '#[derive(Debug, Serialize, Deserialize)]',
        `pub struct ${name} {`,
    ];
    for (const [key, value] of Object.entries(data)) {
        lines.push(`    pub ${key}: ${rustType(value, key)},`);
    }
    lines.push('}');
    return lines.join('\n');
}

function rustType(value: unknown, key: string = ''): string {
    if (value === null) return 'Option<serde_json::Value>';
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return Number.isInteger(value) ? 'i64' : 'f64';
    if (typeof value === 'boolean') return 'bool';
    if (Array.isArray(value)) return `Vec<${value.length > 0 ? rustType(value[0]) : 'serde_json::Value'}>`;
    if (typeof value === 'object') return key.charAt(0).toUpperCase() + key.slice(1);
    return 'serde_json::Value';
}

function generateModel(data: unknown, language: ExportLanguage): string {
    switch (language) {
        case 'typescript': return generateTypeScript(data);
        case 'python': return generatePython(data);
        case 'java': return generateJava(data);
        case 'csharp': return generateCSharp(data);
        case 'go': return generateGo(data);
        case 'rust': return generateRust(data);
        default: return '';
    }
}

export function ExportModal({ isOpen, onClose, jsonData }: ExportModalProps) {
    const { t } = useLanguage();
    const [selectedLang, setSelectedLang] = useState<ExportLanguage>('typescript');
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const parsedData = useMemo(() => {
        if (!jsonData.trim()) return null;
        try {
            return JSON.parse(jsonData);
        } catch {
            return null;
        }
    }, [jsonData]);

    const generatedCode = useMemo(() => {
        if (!parsedData) return `// ${t.exportModal.invalidJson}`;
        return generateModel(parsedData, selectedLang);
    }, [parsedData, selectedLang, t.exportModal.invalidJson]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen || !mounted) return null;

    const backdropStyle: React.CSSProperties = {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
    };

    const modalStyle: React.CSSProperties = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        background: 'var(--bg-secondary, #1a1a24)',
        border: '1px solid var(--border, #2a2a3a)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border, #2a2a3a)',
    };

    const closeButtonStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: 'var(--text-muted, #888)',
        cursor: 'pointer',
    };

    const bodyStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 20px',
        overflow: 'hidden',
        flex: 1,
    };

    const tabsStyle: React.CSSProperties = {
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        marginBottom: '16px',
    };

    const tabStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '8px 16px',
        background: isActive ? 'var(--accent, #667eea)' : 'var(--bg-tertiary, #1a1a24)',
        border: '1px solid var(--border, #2a2a3a)',
        borderRadius: '6px',
        color: isActive ? 'white' : 'var(--text-secondary, #aaa)',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
    });

    const codeContainerStyle: React.CSSProperties = {
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
        border: '1px solid var(--border, #2a2a3a)',
        borderRadius: '8px',
        background: 'var(--bg-primary, #0a0a0f)',
    };

    const copyBtnStyle: React.CSSProperties = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'var(--bg-secondary, #111118)',
        border: '1px solid var(--border, #2a2a3a)',
        borderRadius: '6px',
        color: 'var(--text-secondary, #aaa)',
        fontSize: '12px',
        cursor: 'pointer',
        zIndex: 1,
    };

    const codeStyle: React.CSSProperties = {
        padding: '16px',
        paddingRight: '120px',
        margin: 0,
        height: '100%',
        minHeight: '300px',
        maxHeight: '400px',
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '13px',
        lineHeight: 1.6,
        color: 'var(--text-primary, #f8fafc)',
        whiteSpace: 'pre',
    };

    const modalContent = (
        <>
            <div style={backdropStyle} onClick={onClose} />
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #f8fafc)', margin: 0 }}>
                        {t.exportModal.title}
                    </h2>
                    <button style={closeButtonStyle} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={bodyStyle}>
                    <div style={tabsStyle}>
                        {languages.map((lang) => (
                            <button
                                key={lang.id}
                                style={tabStyle(selectedLang === lang.id)}
                                onClick={() => setSelectedLang(lang.id)}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>

                    <div style={codeContainerStyle}>
                        <button style={copyBtnStyle} onClick={handleCopy}>
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? t.exportModal.copied : t.exportModal.copy}
                        </button>
                        <pre style={codeStyle}>
                            <code>{generatedCode}</code>
                        </pre>
                    </div>
                </div>
            </div>
        </>
    );

    return createPortal(modalContent, document.body);
}

