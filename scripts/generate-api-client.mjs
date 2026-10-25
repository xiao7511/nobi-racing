import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standalone from 'ajv/dist/standalone/index.js';
const api = JSON.parse(await readFile(new URL('../packages/contracts/openapi.json', import.meta.url), 'utf8'));
const operations = Object.entries(api.paths).filter(([, path]) => path.get?.['x-phase-status'] === 'implemented-phase2');
const used = new Set();
function collect(value) {
  if (!value || typeof value !== 'object') return;
  if (value.$ref?.startsWith('#/components/schemas/')) {
    const key = value.$ref.split('/').at(-1);
    if (!used.has(key)) { used.add(key); collect(api.components.schemas[key]); }
  }
  for (const child of Object.values(value)) collect(child);
}
for (const [, path] of operations) collect(path.get.responses);
function type(schema) {
  if (schema.$ref) return `ApiSchemas[${JSON.stringify(schema.$ref.split('/').at(-1))}]`;
  if ('const' in schema) return JSON.stringify(schema.const);
  if (schema.enum) return schema.enum.map(value => JSON.stringify(value)).join(' | ');
  if (schema.oneOf || schema.anyOf) return (schema.oneOf || schema.anyOf).map(type).join(' | ');
  if (schema.allOf) return schema.allOf.map(type).join(' & ');
  if (Array.isArray(schema.type)) return schema.type.map(value => type({ ...schema, type: value })).join(' | ');
  switch (schema.type) {
    case 'null': return 'null';
    case 'integer': case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'string': return 'string';
    case 'array': return `Array<${type(schema.items)}>`;
    case 'object': return '{ ' + Object.entries(schema.properties || {}).map(([key, value]) => `${JSON.stringify(key)}${schema.required?.includes(key) ? '' : '?'}: ${type(value)};`).join(' ') + ' }';
    default: return 'unknown';
  }
}
const names = [...used].sort();
let source = '// Generated from OpenAPI. Run pnpm api:client:generate; do not edit.\nexport interface ApiSchemas {\n';
for (const name of names) source += `  ${JSON.stringify(name)}: ${type(api.components.schemas[name])};\n`;
source += '}\nexport interface ApiResponses {\n';
const roots = {};
for (const [path, operation] of operations) {
  const schema = operation.get.responses['200'].content['application/json'].schema;
  roots[path] = schema.$ref.split('/').at(-1);
  source += `  ${JSON.stringify(path)}: ${type(schema)};\n`;
}
source += '}\nexport const responseSchemas = ' + JSON.stringify(roots, null, 2) + ' as const;\n';
function rewrite(value) {
  if (Array.isArray(value)) return value.map(rewrite);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, key === '$ref' ? child.replace('#/components/schemas/', '#/$defs/') : rewrite(child)]));
}
const schemas = JSON.stringify({ $defs: Object.fromEntries(names.map(name => [name, rewrite(api.components.schemas[name])])) }, null, 2) + '\n';
const ajv = new Ajv2020({ strict: false, inlineRefs: false, code: { source: true, esm: true, lines: true } });
addFormats(ajv);
ajv.addSchema({ $id: 'urn:nobi:api', ...JSON.parse(schemas) });
let validators = standalone(ajv, Object.fromEntries(names.map(name => [name, 'urn:nobi:api#/$defs/' + name])));
const modules = [...new Set([...validators.matchAll(/require\("([^"]+)"\)/g)].map(match => match[1]))];
for (const name of modules) assert.match(name, /^(?:ajv\/dist\/runtime\/[a-zA-Z0-9_-]+|ajv-formats\/dist\/formats)$/);
const imports = modules.map((name, index) => `import * as runtime${index} from ${JSON.stringify(name + '.js')};`).join('\n');
const loader = 'function __runtime(name) { let value; switch (name) { ' + modules.map((name, index) => `case ${JSON.stringify(name)}: value = runtime${index}; break;`).join(' ') + ' default: throw new Error("Unsupported validator runtime"); } return value.default && typeof value.default === "object" ? { ...value, ...value.default } : value; }\n';
validators = '// Generated standalone validators; no runtime eval or Function constructor.\n' + imports + '\n' + (modules.length ? loader : '') + validators.replaceAll('require(', '__runtime(');
const declarations = names.map(name => `export declare const ${name}: (data: unknown) => boolean;`).join('\n') + '\n';
const directory = new URL('../packages/contracts/src/generated/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const [name, content] of [['api.ts', source], ['schemas.json', schemas], ['validators.mjs', validators], ['validators.d.mts', declarations]]) {
  const path = new URL(name, directory);
  if (process.argv.includes('--check')) assert.equal(await readFile(path, 'utf8'), content, 'Generated client drift: ' + name);
  else await writeFile(path, content);
}
console.log('PASS generated API types, paths and runtime schemas' + (process.argv.includes('--check') ? ' drift check' : ' generation'));
