import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const url = new URL('../packages/contracts/openapi.json', import.meta.url);
const original = await readFile(url, 'utf8');
const api = JSON.parse(original);
const ref = name => ({ $ref: '#/components/schemas/' + name });
const string = { type: 'string' };
const integer = { type: 'integer' };
const uuid = { type: 'string', format: 'uuid' };
const time = { type: 'string', format: 'date-time' };
const nullable = schema => ({ ...schema, type: [schema.type, 'null'] });
const decimal = { type: 'string', pattern: '^-?[0-9]+(?:\\.[0-9]{1,3})?$' };
const object = properties => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const metadata = { provenance: ref('Phase2Provenance'), dataStatus: { enum: ['synthetic', 'current', 'stale', 'corrected'] }, updatedAt: time };
Object.assign(api.info, { title: 'NOBI Racing API', version: '0.3.0', description: 'Source-authorized synthetic racing data with PostgreSQL/Redis and a generated Web client. Identity, editorial and staff writes remain disabled/draft. No commercial or real-time provider is connected.' });
api.servers = [{ url: 'http://127.0.0.1:5280', description: 'Loopback development only; not a production service' }];
const schemas = api.components.schemas;
schemas.Phase2Provenance = object({ sourceId: uuid, sourceCode: string, mode: { enum: ['mock', 'licensed'] }, fetchedAt: time, attribution: string, timeZone: string });
schemas.Problem = object({ type: string, title: string, status: integer, code: string, traceId: string });
schemas.Readiness = object({ status: { enum: ['ready', 'degraded', 'unavailable'] }, phase: { const: '2' }, dataMode: { const: 'mock' }, database: { enum: ['up', 'down'] }, cache: { enum: ['up', 'down', 'disabled'] } });
const definitions = {
  Season: { id: uuid, year: integer, seriesCode: string, seriesName: string },
  Circuit: { id: uuid, name: string, countryCode: string, timeZone: string, lengthKm: nullable(decimal), turns: nullable(integer) },
  RaceEvent: { id: uuid, name: string, seasonId: uuid, circuitId: uuid, round: integer, startsAt: time, status: { enum: ['scheduled', 'completed', 'cancelled'] }, laps: nullable(integer), revision: integer, timeZone: string },
  RaceSession: { id: uuid, raceId: uuid, kind: { enum: ['practice', 'qualifying', 'sprint', 'race'] }, sequence: integer, startsAt: time, endsAt: nullable(time) },
  Driver: { id: uuid, name: string, countryCode: nullable(string), carNumber: nullable(integer), biography: nullable(string) },
  Team: { id: uuid, name: string, countryCode: nullable(string) },
  SeasonEntry: { id: uuid, seasonId: uuid, driverId: uuid, teamId: uuid, carNumber: nullable(integer), fromRound: integer, toRound: nullable(integer), driverName: string, teamName: string },
  SessionResult: { id: uuid, sessionId: uuid, raceId: uuid, driverId: uuid, teamId: uuid, driverName: string, teamName: string, position: nullable(integer), resultStatus: { enum: ['classified', 'dnf', 'dns', 'dsq'] }, points: decimal, elapsedMs: nullable(integer) },
  StandingRow: { id: uuid, snapshotId: uuid, seasonId: uuid, afterRaceId: nullable(uuid), capturedAt: time, snapshotRevision: integer, position: integer, points: decimal, wins: integer, name: string },
};
for (const [name, fields] of Object.entries(definitions)) {
  schemas[name] = object({ ...fields, ...metadata });
  schemas[name + 'PageV2'] = object({ items: { type: 'array', items: ref(name) }, nextCursor: { type: ['string', 'null'], maxLength: 512 }, snapshotVersion: { type: 'string', pattern: '^[a-f0-9]{64}$' }, snapshotId: nullable(uuid), dataMode: { enum: ['mock', 'licensed', 'mixed', 'empty'] } });
  schemas[name + 'DetailV2'] = object({ data: ref(name), dataMode: { enum: ['mock', 'licensed'] } });
}
const query = (name, schema, required = false) => ({ name, in: 'query', required, schema });
const common = [query('locale', { enum: ['en-US', 'zh-CN'], default: 'en-US' }), query('limit', { type: 'integer', minimum: 1, maximum: 100, default: 20 }), query('cursor', { type: 'string', minLength: 1, maxLength: 512 })];
const pathId = { name: 'id', in: 'path', required: true, schema: uuid };
const response = (schema, description = 'Success') => ({ description, content: { 'application/json': { schema } } });
const problem = { description: 'Safe RFC 9457 problem; no provider payload or internal details', content: { 'application/problem+json': { schema: ref('Problem') } } };
const operation = (id, name, parameters, detail = false) => ({
  operationId: id, tags: ['Data'], summary: id.replace(/([A-Z])/g, ' $1'), security: [], 'x-phase-status': 'implemented-phase2', parameters,
  description: 'Server-side territory and a complete approved source grant are checked before database or cache facts are returned. All current fixtures are synthetic. Cursors bind filters, source and grant revisions. Sensitive responses use Cache-Control: no-store.',
  responses: { 200: response(ref(name + (detail ? 'DetailV2' : 'PageV2'))), 400: problem, ...(detail ? { 404: problem } : { 409: problem }), 429: { ...problem, headers: { 'Retry-After': { schema: integer, description: 'Seconds before retry' } } }, 503: problem, 500: problem },
});
for (const [path, name, extras] of [
  ['seasons', 'Season', [query('year', { type: 'integer', minimum: 1900, maximum: 2200 }), query('seriesCode', string)]],
  ['circuits', 'Circuit', []], ['drivers', 'Driver', []], ['teams', 'Team', []],
  ['races', 'RaceEvent', [query('seasonId', uuid), query('status', { enum: ['scheduled', 'completed', 'cancelled'] }), query('from', time), query('to', time)]],
]) {
  api.paths['/api/v1/' + path] = { get: operation('list' + name + 's', name, [...common, ...extras]) };
  api.paths['/api/v1/' + path + '/{id}'] = { get: operation('get' + name, name, [pathId, common[0]], true) };
}
for (const [path, name] of [['/races/{id}/sessions', 'RaceSession'], ['/sessions/{id}/results', 'SessionResult'], ['/seasons/{id}/entries', 'SeasonEntry']]) {
  api.paths['/api/v1' + path] = { get: operation('list' + name + 's', name, [pathId, ...common]) };
}
api.paths['/api/v1/standings'] = { get: operation('listStandings', 'StandingRow', [...common, query('seasonId', uuid, true), query('type', { enum: ['driver', 'team'], default: 'driver' }), query('snapshotId', uuid)]) };
api.paths['/api/v1/readiness'].get = { operationId: 'getReadiness', tags: ['Foundation'], summary: 'Check database and cache readiness', security: [], 'x-phase-status': 'implemented-phase2', responses: { 200: response(ref('Readiness')), 503: response(ref('Readiness'), 'Database unavailable') } };
for (const [path, item] of Object.entries(api.paths)) if (path.includes('/me')) for (const op of Object.values(item)) if (op.parameters) for (const parameter of op.parameters) if (parameter.name === 'locale' && parameter.schema) parameter.schema.enum = ['en-US', 'zh-CN'];
const used = new Set();
const visit = value => {
  if (!value || typeof value !== 'object') return;
  if (value.$ref?.startsWith('#/components/schemas/')) {
    const name = value.$ref.split('/').at(-1);
    if (!used.has(name)) { used.add(name); visit(schemas[name]); }
  }
  for (const child of Object.values(value)) visit(child);
};
visit(api.paths);
for (const name of Object.keys(schemas)) if (!used.has(name)) delete schemas[name];
const generated = JSON.stringify(api, null, 2) + '\n';
if (process.argv.includes('--check')) { assert.equal(original, generated, 'Phase 2 OpenAPI is not canonical; run pnpm api:phase2:update'); console.log('PASS Phase 2 OpenAPI generation drift check'); }
else await writeFile(url, generated);
