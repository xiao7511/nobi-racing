import { readFile, mkdir, writeFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import assert from 'node:assert/strict';
const api = JSON.parse(await readFile(new URL('../packages/contracts/openapi.json', import.meta.url), 'utf8'));
const samples = JSON.parse(await readFile(new URL('../services/racing-api/target/phase2-contract-samples.json', import.meta.url), 'utf8'));
assert.ok(samples.length > 20, 'Real backend integration response samples are required');
const replaceRefs = value => {
  if (Array.isArray(value)) return value.map(replaceRefs);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, key === '$ref' ? child.replace('#/components/schemas/', '#/$defs/') : replaceRefs(child)]));
};
const ajv = new Ajv2020({ strict: false, allErrors: true }); addFormats(ajv);
const results = [];
for (const sample of samples) {
  const response = api.paths[sample.path]?.get.responses[sample.status];
  assert.ok(response, 'Missing documented response: ' + sample.path + ' ' + sample.status);
  const schema = response.content['application/json']?.schema || response.content['application/problem+json']?.schema;
  const validate = ajv.compile({ ...replaceRefs(schema), $defs: replaceRefs(api.components.schemas) });
  assert.ok(validate(sample.body), sample.path + ': ' + JSON.stringify(validate.errors));
  results.push({ path: sample.path, status: sample.status, passed: true });
}
const output = new URL('../docs/verification/phase-2/', import.meta.url);
await mkdir(output, { recursive: true });
await writeFile(new URL('contracts.json', output), JSON.stringify({ checkedAt: new Date().toISOString(), source: 'Actual HTTP responses captured by DatabaseIT; no fabricated examples', count: results.length, checks: results }, null, 2) + '\n');
console.log(`PASS ${results.length} actual backend responses against OpenAPI 3.1 schemas`);
