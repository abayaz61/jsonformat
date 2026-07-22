import test from 'node:test';
import assert from 'node:assert/strict';
import {
  jsonToYaml,
  yamlToJson,
  jsonToXml,
  jsonToCsv,
  csvToJson,
  jsonToToml,
  jsonToTypescript,
  jsonToCSharp,
  jsonToGo,
  jsonToPython,
  convertFormat,
} from './converters.ts';

const testJson = JSON.stringify(
  {
    name: 'John Doe',
    age: 30,
    isAdmin: true,
    skills: ['JavaScript', 'TypeScript'],
  },
  null,
  2
);

test('jsonToYaml converts object to valid YAML string', () => {
  const yaml = jsonToYaml(JSON.parse(testJson));
  assert.ok(yaml.includes('name: John Doe'));
  assert.ok(yaml.includes('age: 30'));
  assert.ok(yaml.includes('isAdmin: true'));
  assert.ok(yaml.includes('- JavaScript'));
});

test('yamlToJson converts YAML to JSON object string', () => {
  const yamlStr = 'name: John Doe\nage: 30\nisAdmin: true';
  const jsonStr = yamlToJson(yamlStr);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.name, 'John Doe');
  assert.equal(parsed.age, 30);
  assert.equal(parsed.isAdmin, true);
});

test('jsonToXml creates valid XML structure', () => {
  const xml = jsonToXml(JSON.parse(testJson));
  assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<name>John Doe</name>'));
  assert.ok(xml.includes('<age>30</age>'));
});

test('jsonToCsv and csvToJson convert array of objects bi-directionally', () => {
  const data = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];
  const csv = jsonToCsv(data);
  assert.ok(csv.includes('id,name'));
  assert.ok(csv.includes('1,Alice'));

  const json = csvToJson(csv);
  const parsed = JSON.parse(json);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].name, 'Alice');
});

test('Code generators produce valid structure', () => {
  const parsed = JSON.parse(testJson);

  const ts = jsonToTypescript(parsed, 'User');
  assert.ok(ts.includes('export interface User'));
  assert.ok(ts.includes('name: string;'));
  assert.ok(ts.includes('age: number;'));

  const cs = jsonToCSharp(parsed, 'User');
  assert.ok(cs.includes('public class User'));
  assert.ok(cs.includes('public string Name { get; set; }'));

  const go = jsonToGo(parsed, 'User');
  assert.ok(go.includes('type User struct'));
  assert.ok(go.includes('Name string `json:"name"`'));

  const py = jsonToPython(parsed, 'User');
  assert.ok(py.includes('class User:'));
  assert.ok(py.includes('name: str'));
});

test('convertFormat returns correct monacoLanguage and extension', () => {
  const resYaml = convertFormat(testJson, 'yaml');
  assert.equal(resYaml.monacoLanguage, 'yaml');
  assert.equal(resYaml.extension, 'yaml');

  const resCs = convertFormat(testJson, 'csharp');
  assert.equal(resCs.monacoLanguage, 'csharp');
  assert.equal(resCs.extension, 'cs');
});
