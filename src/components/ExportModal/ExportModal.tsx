'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts';
import { jsonToEnv } from '@/utils/converters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: string;
}

type ExportLanguage = 'typescript' | 'env' | 'python' | 'java' | 'csharp' | 'go' | 'rust';

const languages: { id: ExportLanguage; name: string; extension: string }[] = [
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'env', name: '.ENV File', extension: 'env' },
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

function pythonType(value: unknown): string {
  if (value === null) return 'Optional[Any]';
  if (typeof value === 'string') return 'str';
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float';
  if (typeof value === 'boolean') return 'bool';
  if (Array.isArray(value)) return `List[${value.length > 0 ? pythonType(value[0]) : 'Any'}]`;
  return 'Any';
}

function generatePython(data: unknown, name: string = 'Root'): string {
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

function javaType(value: unknown, key: string = ''): string {
  if (value === null) return 'Object';
  if (typeof value === 'string') return 'String';
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return `List<${value.length > 0 ? javaType(value[0]) : 'Object'}>`;
  if (typeof value === 'object') return key.charAt(0).toUpperCase() + key.slice(1);
  return 'Object';
}

function generateJava(data: unknown, name: string = 'Root'): string {
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

function csharpType(value: unknown, key: string = ''): string {
  if (value === null) return 'object?';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double';
  if (typeof value === 'boolean') return 'bool';
  if (Array.isArray(value)) return `List<${value.length > 0 ? csharpType(value[0]) : 'object'}>`;
  if (typeof value === 'object') return key.charAt(0).toUpperCase() + key.slice(1);
  return 'object';
}

function generateCSharp(data: unknown, name: string = 'Root'): string {
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

function goType(value: unknown, key: string = ''): string {
  if (value === null) return 'interface{}';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float64';
  if (typeof value === 'boolean') return 'bool';
  if (Array.isArray(value)) return `[]${value.length > 0 ? goType(value[0]) : 'interface{}'}`;
  if (typeof value === 'object') return key.charAt(0).toUpperCase() + key.slice(1);
  return 'interface{}';
}

function generateGo(data: unknown, name: string = 'Root'): string {
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

function rustType(value: unknown, key: string = ''): string {
  if (value === null) return 'Option<serde_json::Value>';
  if (typeof value === 'string') return 'String';
  if (typeof value === 'number') return Number.isInteger(value) ? 'i64' : 'f64';
  if (typeof value === 'boolean') return 'bool';
  if (Array.isArray(value)) return `Vec<${value.length > 0 ? rustType(value[0]) : 'serde_json::Value'}>`;
  if (typeof value === 'object') return key.charAt(0).toUpperCase() + key.slice(1);
  return 'serde_json::Value';
}

function generateRust(data: unknown, name: string = 'Root'): string {
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

function generateModel(data: unknown, language: ExportLanguage): string {
  switch (language) {
    case 'typescript':
      return generateTypeScript(data);
    case 'env':
      return jsonToEnv(data);
    case 'python':
      return generatePython(data);
    case 'java':
      return generateJava(data);
    case 'csharp':
      return generateCSharp(data);
    case 'go':
      return generateGo(data);
    case 'rust':
      return generateRust(data);
    default:
      return '';
  }
}

export function ExportModal({ isOpen, onClose, jsonData }: ExportModalProps) {
  const { t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<ExportLanguage>('typescript');
  const [copied, setCopied] = useState(false);
  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);

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

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
        onClick={onClose}
      />
      <div
        style={{
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
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border, #2a2a3a)',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #e0e0f0)' }}>
            {t.exportModal.title}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted, #606075)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {languages.map((lang) => (
              <button
                key={lang.id}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: selectedLang === lang.id ? '1px solid var(--accent, #6366f1)' : '1px solid var(--border, #2a2a3a)',
                  background: selectedLang === lang.id ? 'var(--accent, #6366f1)' : 'var(--bg-tertiary, #222230)',
                  color: selectedLang === lang.id ? '#ffffff' : 'var(--text-secondary, #a0a0b0)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                }}
                onClick={() => setSelectedLang(lang.id)}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <pre
            style={{
              background: 'var(--bg-primary, #12121a)',
              border: '1px solid var(--border, #2a2a3a)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: "'Geist Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'var(--text-primary, #e0e0f0)',
              overflowX: 'auto',
              whiteSpace: 'pre',
              maxHeight: '350px',
            }}
          >
            <code>{generatedCode}</code>
          </pre>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid var(--border, #2a2a3a)',
          }}
        >
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--accent, #6366f1)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onClick={handleCopy}
            disabled={!parsedData}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t.exportModal.copied : t.exportModal.copy}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
