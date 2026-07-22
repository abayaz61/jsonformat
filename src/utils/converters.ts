/**
 * Pure client-side bi-directional & code generation converters.
 * 100% browser-compatible without server or external API calls.
 */

export type TargetFormat =
  | 'yaml'
  | 'xml'
  | 'csv'
  | 'toml'
  | 'typescript'
  | 'csharp'
  | 'go'
  | 'python'
  | 'java'
  | 'dart';

// Helper: capitalize string for class/type names
function capitalize(str: string): string {
  if (!str) return 'Root';
  const clean = str.replace(/[^a-zA-Z0-9]/g, '');
  if (!clean) return 'Root';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

// Helper: convert string to camelCase
function toCamelCase(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9_]/g, '');
  return clean.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
}

// ── 1. JSON ↔ YAML ──────────────────────────────────────────

export function jsonToYaml(jsonInput: unknown, indentLevel = 0): string {
  const indent = '  '.repeat(indentLevel);

  if (jsonInput === null || jsonInput === undefined) return `${indent}null`;
  if (typeof jsonInput === 'boolean' || typeof jsonInput === 'number') return `${indent}${jsonInput}`;
  if (typeof jsonInput === 'string') {
    if (jsonInput.includes('\n') || jsonInput.includes(':') || jsonInput.includes('#') || jsonInput.trim() === '') {
      return `${indent}"${jsonInput.replace(/"/g, '\\"')}"`;
    }
    return `${indent}${jsonInput}`;
  }

  if (Array.isArray(jsonInput)) {
    if (jsonInput.length === 0) return `${indent}[]`;
    const items = jsonInput.map((item) => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const objLines = jsonToYaml(item, indentLevel + 1).trimStart();
        return `${indent}- ${objLines}`;
      }
      return `${indent}- ${jsonToYaml(item, 0).trim()}`;
    });
    return items.join('\n');
  }

  if (typeof jsonInput === 'object') {
    const keys = Object.keys(jsonInput as object);
    if (keys.length === 0) return `${indent}{}`;

    const lines: string[] = [];
    for (const key of keys) {
      const val = (jsonInput as Record<string, unknown>)[key];
      const safeKey = /^[a-zA-Z0-9_-]+$/.test(key) ? key : `"${key}"`;

      if (val === null || val === undefined) {
        lines.push(`${indent}${safeKey}: null`);
      } else if (typeof val === 'object' && val !== null) {
        if (Array.isArray(val) && val.length === 0) {
          lines.push(`${indent}${safeKey}: []`);
        } else if (!Array.isArray(val) && Object.keys(val).length === 0) {
          lines.push(`${indent}${safeKey}: {}`);
        } else {
          lines.push(`${indent}${safeKey}:\n${jsonToYaml(val, indentLevel + 1)}`);
        }
      } else {
        lines.push(`${indent}${safeKey}: ${jsonToYaml(val, 0).trim()}`);
      }
    }
    return lines.join('\n');
  }

  return `${indent}${String(jsonInput)}`;
}

export function yamlToJson(yamlText: string): string {
  // Simple robust client-side YAML parser for key-value structures
  const lines = yamlText.split('\n');
  const root: Record<string, unknown> = {};
  let currentKey = '';

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.includes(':')) {
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIdx).trim().replace(/^["']|["']$/g, '');
      const rawVal = trimmed.slice(colonIdx + 1).trim();

      currentKey = key;
      if (rawVal === '') {
        root[key] = {};
      } else if (rawVal === 'true') {
        root[key] = true;
      } else if (rawVal === 'false') {
        root[key] = false;
      } else if (rawVal === 'null' || rawVal === '~') {
        root[key] = null;
      } else if (!isNaN(Number(rawVal)) && rawVal !== '') {
        root[key] = Number(rawVal);
      } else {
        root[key] = rawVal.replace(/^["']|["']$/g, '');
      }
    }
  }

  return JSON.stringify(root, null, 2);
}

// ── 2. JSON ↔ XML ───────────────────────────────────────────

export function jsonToXml(jsonObj: unknown, rootName = 'root'): string {
  function toXml(val: unknown, tagName: string, level = 1): string {
    const indent = '  '.repeat(level);

    if (val === null || val === undefined) {
      return `${indent}<${tagName}/>`;
    }

    if (typeof val !== 'object') {
      const safeText = String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `${indent}<${tagName}>${safeText}</${tagName}>`;
    }

    if (Array.isArray(val)) {
      const itemTag = tagName.endsWith('s') && tagName.length > 1 ? tagName.slice(0, -1) : 'item';
      const children = val.map((item) => toXml(item, itemTag, level + 1)).join('\n');
      return `${indent}<${tagName}>\n${children}\n${indent}</${tagName}>`;
    }

    const keys = Object.keys(val as object);
    if (keys.length === 0) {
      return `${indent}<${tagName}/>`;
    }

    const children = keys
      .map((key) => {
        const safeTag = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        return toXml((val as Record<string, unknown>)[key], safeTag, level + 1);
      })
      .join('\n');

    return `${indent}<${tagName}>\n${children}\n${indent}</${tagName}>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(jsonObj, rootName, 0)}`;
}

export function xmlToJson(xmlText: string): string {
  // Simple XML parser via DOMParser if available in browser
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      function nodeToObj(node: Node): unknown {
        if (node.nodeType === Node.TEXT_NODE) {
          const txt = node.nodeValue?.trim();
          if (!txt) return null;
          if (txt === 'true') return true;
          if (txt === 'false') return false;
          if (!isNaN(Number(txt))) return Number(txt);
          return txt;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as Element;
          const obj: Record<string, unknown> = {};

          for (let i = 0; i < elem.children.length; i++) {
            const child = elem.children[i];
            const childName = child.tagName;
            const childVal = nodeToObj(child);

            if (obj[childName] !== undefined) {
              if (!Array.isArray(obj[childName])) {
                obj[childName] = [obj[childName]];
              }
              (obj[childName] as unknown[]).push(childVal);
            } else {
              obj[childName] = childVal;
            }
          }

          if (elem.children.length === 0) {
            const txt = elem.textContent?.trim() || '';
            if (txt === 'true') return true;
            if (txt === 'false') return false;
            if (!isNaN(Number(txt)) && txt !== '') return Number(txt);
            return txt;
          }

          return obj;
        }

        return null;
      }

      const result = nodeToObj(xmlDoc.documentElement);
      return JSON.stringify(result, null, 2);
    } catch {
      return JSON.stringify({ error: 'Invalid XML' }, null, 2);
    }
  }

  return JSON.stringify({ error: 'XML Parser not available' }, null, 2);
}

// ── 3. JSON ↔ CSV ───────────────────────────────────────────

export function jsonToCsv(jsonObj: unknown): string {
  let rows: Record<string, unknown>[] = [];

  if (Array.isArray(jsonObj)) {
    rows = jsonObj.filter((item) => typeof item === 'object' && item !== null) as Record<string, unknown>[];
  } else if (typeof jsonObj === 'object' && jsonObj !== null) {
    rows = [jsonObj as Record<string, unknown>];
  }

  if (rows.length === 0) return '';

  // Collect all unique headers
  const headersSet = new Set<string>();
  rows.forEach((row) => Object.keys(row).forEach((k) => headersSet.add(k)));
  const headers = Array.from(headersSet);

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map((h) => escapeCsv(h)).join(',');
  const dataLines = rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(','));

  return [headerLine, ...dataLines].join('\n');
}

export function csvToJson(csvText: string): string {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return JSON.stringify([], null, 2);

  const parseRow = (rowText: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"' && (i === 0 || rowText[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const headers = parseRow(lines[0]);
  const result: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj: Record<string, unknown> = {};

    headers.forEach((header, idx) => {
      const val = values[idx] ?? '';
      if (val === 'true') obj[header] = true;
      else if (val === 'false') obj[header] = false;
      else if (!isNaN(Number(val)) && val !== '') obj[header] = Number(val);
      else obj[header] = val;
    });

    result.push(obj);
  }

  return JSON.stringify(result, null, 2);
}

// ── 4. JSON ↔ TOML ───────────────────────────────────────────

export function jsonToToml(jsonObj: unknown, parentKey = ''): string {
  if (typeof jsonObj !== 'object' || jsonObj === null || Array.isArray(jsonObj)) {
    return `# Only JSON objects can be converted to TOML\nvalue = ${JSON.stringify(jsonObj)}`;
  }

  const lines: string[] = [];
  const tables: string[] = [];

  for (const [key, val] of Object.entries(jsonObj as Record<string, unknown>)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (val === null || val === undefined) {
      lines.push(`${key} = ""`);
    } else if (typeof val === 'boolean' || typeof val === 'number') {
      lines.push(`${key} = ${val}`);
    } else if (typeof val === 'string') {
      lines.push(`${key} = "${val.replace(/"/g, '\\"')}"`);
    } else if (Array.isArray(val)) {
      lines.push(`${key} = ${JSON.stringify(val)}`);
    } else if (typeof val === 'object') {
      tables.push(`\n[${fullKey}]\n${jsonToToml(val, fullKey)}`);
    }
  }

  return [...lines, ...tables].join('\n');
}

export function tomlToJson(tomlText: string): string {
  // Client-side key-value TOML parser
  const lines = tomlText.split('\n');
  const result: Record<string, unknown> = {};
  let currentSection = result;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const sectionName = trimmed.slice(1, -1).trim();
      result[sectionName] = {};
      currentSection = result[sectionName] as Record<string, unknown>;
      continue;
    }

    if (trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const rawVal = rest.join('=').trim();
      const cleanKey = key.trim();

      if (rawVal === 'true') currentSection[cleanKey] = true;
      else if (rawVal === 'false') currentSection[cleanKey] = false;
      else if (!isNaN(Number(rawVal))) currentSection[cleanKey] = Number(rawVal);
      else currentSection[cleanKey] = rawVal.replace(/^["']|["']$/g, '');
    }
  }

  return JSON.stringify(result, null, 2);
}

// ── 5. CODE GENERATORS (JSON → TypeScript, C#, Go, Python, Java, Dart) ──

export function jsonToTypescript(jsonObj: unknown, name = 'Root'): string {
  const interfaces: string[] = [];

  function generateInterface(obj: unknown, interfaceName: string): string {
    if (typeof obj !== 'object' || obj === null) return 'any';
    if (Array.isArray(obj)) {
      const itemType = obj.length > 0 ? generateInterface(obj[0], `${interfaceName}Item`) : 'any';
      return `${itemType}[]`;
    }

    const fields: string[] = [];

    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;

      if (val === null || val === undefined) {
        fields.push(`  ${safeKey}?: any;`);
      } else if (typeof val === 'boolean') {
        fields.push(`  ${safeKey}: boolean;`);
      } else if (typeof val === 'number') {
        fields.push(`  ${safeKey}: number;`);
      } else if (typeof val === 'string') {
        fields.push(`  ${safeKey}: string;`);
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const childName = capitalize(key) + 'Item';
          generateInterface(val[0], childName);
          fields.push(`  ${safeKey}: ${childName}[];`);
        } else {
          const primitiveType = val.length > 0 ? typeof val[0] : 'any';
          fields.push(`  ${safeKey}: ${primitiveType}[];`);
        }
      } else if (typeof val === 'object') {
        const childName = capitalize(key);
        generateInterface(val, childName);
        fields.push(`  ${safeKey}: ${childName};`);
      }
    }

    const code = `export interface ${interfaceName} {\n${fields.join('\n')}\n}`;
    interfaces.unshift(code);
    return interfaceName;
  }

  generateInterface(jsonObj, capitalize(name));
  return Array.from(new Set(interfaces)).join('\n\n');
}

export function jsonToCSharp(jsonObj: unknown, name = 'Root'): string {
  const classes: string[] = [];

  function generateClass(obj: unknown, className: string): string {
    if (typeof obj !== 'object' || obj === null) return 'object';
    if (Array.isArray(obj)) {
      const itemType = obj.length > 0 ? generateClass(obj[0], `${className}Item`) : 'object';
      return `List<${itemType}>`;
    }

    const props: string[] = [];

    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const propName = capitalize(key);
      const jsonAttr = `    [JsonPropertyName("${key}")]`;

      if (val === null || val === undefined) {
        props.push(`${jsonAttr}\n    public object ${propName} { get; set; }`);
      } else if (typeof val === 'boolean') {
        props.push(`${jsonAttr}\n    public bool ${propName} { get; set; }`);
      } else if (typeof val === 'number') {
        const numType = Number.isInteger(val) ? 'int' : 'double';
        props.push(`${jsonAttr}\n    public ${numType} ${propName} { get; set; }`);
      } else if (typeof val === 'string') {
        props.push(`${jsonAttr}\n    public string ${propName} { get; set; }`);
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const childName = capitalize(key) + 'Item';
          generateClass(val[0], childName);
          props.push(`${jsonAttr}\n    public List<${childName}> ${propName} { get; set; }`);
        } else {
          const prim = val.length > 0 ? (typeof val[0] === 'number' ? 'int' : typeof val[0]) : 'object';
          props.push(`${jsonAttr}\n    public List<${prim}> ${propName} { get; set; }`);
        }
      } else if (typeof val === 'object') {
        const childName = capitalize(key);
        generateClass(val, childName);
        props.push(`${jsonAttr}\n    public ${childName} ${propName} { get; set; }`);
      }
    }

    const code = `public class ${className}\n{\n${props.join('\n\n')}\n}`;
    classes.unshift(code);
    return className;
  }

  generateClass(jsonObj, capitalize(name));
  return `using System.Text.Json.Serialization;\nusing System.Collections.Generic;\n\n${Array.from(new Set(classes)).join('\n\n')}`;
}

export function jsonToGo(jsonObj: unknown, name = 'Root'): string {
  const structs: string[] = [];

  function generateStruct(obj: unknown, structName: string): string {
    if (typeof obj !== 'object' || obj === null) return 'interface{}';
    if (Array.isArray(obj)) {
      const itemType = obj.length > 0 ? generateStruct(obj[0], `${structName}Item`) : 'interface{}';
      return `[]${itemType}`;
    }

    const fields: string[] = [];

    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const fieldName = capitalize(key);
      const tag = `\`json:"${key}"\``;

      if (val === null || val === undefined) {
        fields.push(`\t${fieldName} interface{} ${tag}`);
      } else if (typeof val === 'boolean') {
        fields.push(`\t${fieldName} bool ${tag}`);
      } else if (typeof val === 'number') {
        const numType = Number.isInteger(val) ? 'int64' : 'float64';
        fields.push(`\t${fieldName} ${numType} ${tag}`);
      } else if (typeof val === 'string') {
        fields.push(`\t${fieldName} string ${tag}`);
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const childName = capitalize(key) + 'Item';
          generateStruct(val[0], childName);
          fields.push(`\t${fieldName} []${childName} ${tag}`);
        } else {
          fields.push(`\t${fieldName} []interface{} ${tag}`);
        }
      } else if (typeof val === 'object') {
        const childName = capitalize(key);
        generateStruct(val, childName);
        fields.push(`\t${fieldName} ${childName} ${tag}`);
      }
    }

    const code = `type ${structName} struct {\n${fields.join('\n')}\n}`;
    structs.unshift(code);
    return structName;
  }

  generateStruct(jsonObj, capitalize(name));
  return Array.from(new Set(structs)).join('\n\n');
}

export function jsonToPython(jsonObj: unknown, name = 'Root'): string {
  const classes: string[] = [];

  function generateClass(obj: unknown, className: string): string {
    if (typeof obj !== 'object' || obj === null) return 'Any';
    if (Array.isArray(obj)) {
      const itemType = obj.length > 0 ? generateClass(obj[0], `${className}Item`) : 'Any';
      return `List[${itemType}]`;
    }

    const fields: string[] = [];

    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const fieldName = toCamelCase(key);

      if (val === null || val === undefined) {
        fields.push(`    ${fieldName}: Optional[Any] = None`);
      } else if (typeof val === 'boolean') {
        fields.push(`    ${fieldName}: bool`);
      } else if (typeof val === 'number') {
        const numType = Number.isInteger(val) ? 'int' : 'float';
        fields.push(`    ${fieldName}: ${numType}`);
      } else if (typeof val === 'string') {
        fields.push(`    ${fieldName}: str`);
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const childName = capitalize(key) + 'Item';
          generateClass(val[0], childName);
          fields.push(`    ${fieldName}: List[${childName}]`);
        } else {
          fields.push(`    ${fieldName}: List[Any]`);
        }
      } else if (typeof val === 'object') {
        const childName = capitalize(key);
        generateClass(val, childName);
        fields.push(`    ${fieldName}: ${childName}`);
      }
    }

    const code = `@dataclass\nclass ${className}:\n${fields.join('\n')}`;
    classes.unshift(code);
    return className;
  }

  generateClass(jsonObj, capitalize(name));
  return `from dataclasses import dataclass\nfrom typing import List, Optional, Any\n\n${Array.from(new Set(classes)).join('\n\n')}`;
}

export function jsonToJava(jsonObj: unknown, name = 'Root'): string {
  const classes: string[] = [];

  function generateClass(obj: unknown, className: string): string {
    if (typeof obj !== 'object' || obj === null) return 'Object';
    if (Array.isArray(obj)) {
      const itemType = obj.length > 0 ? generateClass(obj[0], `${className}Item`) : 'Object';
      return `List<${itemType}>`;
    }

    const fields: string[] = [];

    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const fieldName = toCamelCase(key);

      if (val === null || val === undefined) {
        fields.push(`    private Object ${fieldName};`);
      } else if (typeof val === 'boolean') {
        fields.push(`    private Boolean ${fieldName};`);
      } else if (typeof val === 'number') {
        const numType = Number.isInteger(val) ? 'Integer' : 'Double';
        fields.push(`    private ${numType} ${fieldName};`);
      } else if (typeof val === 'string') {
        fields.push(`    private String ${fieldName};`);
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const childName = capitalize(key) + 'Item';
          generateClass(val[0], childName);
          fields.push(`    private List<${childName}> ${fieldName};`);
        } else {
          fields.push(`    private List<Object> ${fieldName};`);
        }
      } else if (typeof val === 'object') {
        const childName = capitalize(key);
        generateClass(val, childName);
        fields.push(`    private ${childName} ${fieldName};`);
      }
    }

    const code = `public class ${className} {\n${fields.join('\n')}\n}`;
    classes.unshift(code);
    return className;
  }

  generateClass(jsonObj, capitalize(name));
  return `import java.util.List;\n\n${Array.from(new Set(classes)).join('\n\n')}`;
}

export function jsonToDart(jsonObj: unknown, name = 'Root'): string {
  const classes: string[] = [];

  function generateClass(obj: unknown, className: string): string {
    if (typeof obj !== 'object' || obj === null) return 'dynamic';
    if (Array.isArray(obj)) {
      const itemType = obj.length > 0 ? generateClass(obj[0], `${className}Item`) : 'dynamic';
      return `List<${itemType}>`;
    }

    const fields: string[] = [];

    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const fieldName = toCamelCase(key);

      if (val === null || val === undefined) {
        fields.push(`  final dynamic ${fieldName};`);
      } else if (typeof val === 'boolean') {
        fields.push(`  final bool? ${fieldName};`);
      } else if (typeof val === 'number') {
        const numType = Number.isInteger(val) ? 'int' : 'double';
        fields.push(`  final ${numType}? ${fieldName};`);
      } else if (typeof val === 'string') {
        fields.push(`  final String? ${fieldName};`);
      } else if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const childName = capitalize(key) + 'Item';
          generateClass(val[0], childName);
          fields.push(`  final List<${childName}>? ${fieldName};`);
        } else {
          fields.push(`  final List<dynamic>? ${fieldName};`);
        }
      } else if (typeof val === 'object') {
        const childName = capitalize(key);
        generateClass(val, childName);
        fields.push(`  final ${childName}? ${fieldName};`);
      }
    }

    const code = `class ${className} {\n${fields.join('\n')}\n\n  ${className}({${Object.keys(obj as object).map(k => `this.${toCamelCase(k)}`).join(', ')}}); \n}`;
    classes.unshift(code);
    return className;
  }

  generateClass(jsonObj, capitalize(name));
  return Array.from(new Set(classes)).join('\n\n');
}

// ── MAIN CONVERT FUNCTION ───────────────────────────────────

export function convertFormat(
  input: string,
  targetFormat: TargetFormat
): { output: string; monacoLanguage: string; extension: string } {
  if (!input.trim()) {
    return { output: '', monacoLanguage: 'text', extension: 'txt' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    // If input is not JSON, try parsing as YAML/XML/CSV/TOML to JSON first
    try {
      const jsonFromYaml = yamlToJson(input);
      parsed = JSON.parse(jsonFromYaml);
    } catch {
      return { output: '// Error: Invalid input data format', monacoLanguage: 'text', extension: 'txt' };
    }
  }

  switch (targetFormat) {
    case 'yaml':
      return { output: jsonToYaml(parsed), monacoLanguage: 'yaml', extension: 'yaml' };

    case 'xml':
      return { output: jsonToXml(parsed), monacoLanguage: 'xml', extension: 'xml' };

    case 'csv':
      return { output: jsonToCsv(parsed), monacoLanguage: 'plaintext', extension: 'csv' };

    case 'toml':
      return { output: jsonToToml(parsed), monacoLanguage: 'ini', extension: 'toml' };

    case 'typescript':
      return { output: jsonToTypescript(parsed), monacoLanguage: 'typescript', extension: 'ts' };

    case 'csharp':
      return { output: jsonToCSharp(parsed), monacoLanguage: 'csharp', extension: 'cs' };

    case 'go':
      return { output: jsonToGo(parsed), monacoLanguage: 'go', extension: 'go' };

    case 'python':
      return { output: jsonToPython(parsed), monacoLanguage: 'python', extension: 'py' };

    case 'java':
      return { output: jsonToJava(parsed), monacoLanguage: 'java', extension: 'java' };

    case 'dart':
      return { output: jsonToDart(parsed), monacoLanguage: 'dart', extension: 'dart' };

    default:
      return { output: JSON.stringify(parsed, null, 2), monacoLanguage: 'json', extension: 'json' };
  }
}
