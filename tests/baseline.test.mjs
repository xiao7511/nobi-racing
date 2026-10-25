import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canUseSource } from '../packages/contracts/src/index.ts';
const grant = { sourceId: 'mock', enabled: true, status: 'approved', validFrom: '2026-01-01T00:00:00Z', validUntil: '2026-02-01T00:00:00Z', capabilities: ['schedule'], territories: ['CN'] };
const now = new Date('2026-01-15T00:00:00Z');
test('source policy checks approval, capability, territory, enablement and both time bounds', () => {
  assert.equal(canUseSource(grant, 'schedule', 'CN', now), true);
  for (const patch of [{ enabled: false }, { status: 'pending' }, { status: 'revoked' }, { capabilities: [] }, { territories: [] }, { validFrom: 'invalid' }, { validUntil: 'invalid' }]) assert.equal(canUseSource({ ...grant, ...patch }, 'schedule', 'CN', now), false);
  assert.equal(canUseSource(grant, 'live', 'CN', now), false);
  assert.equal(canUseSource(grant, 'schedule', 'US', now), false);
  assert.equal(canUseSource(grant, 'schedule', 'CN', new Date(grant.validFrom)), true);
  assert.equal(canUseSource(grant, 'schedule', 'CN', new Date(grant.validUntil)), false);
  assert.equal(canUseSource(grant, 'schedule', 'CN', new Date('2025-01-01')), false);
});
const css = await readFile(new URL('../packages/design-tokens/src/tokens.css', import.meta.url), 'utf8');
const color = name => css.match(new RegExp('--color-' + name + ': (#[a-f0-9]{6})'))[1];
const luminance = hex => {
  const c = hex.slice(1).match(/../g).map(n => parseInt(n,16)/255).map(n => n <= .04045 ? n/12.92 : ((n+.055)/1.055)**2.4);
  return .2126*c[0] + .7152*c[1] + .0722*c[2];
};
const contrast = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
test('core token pairs meet WCAG AA contrast', () => {
  for (const fg of ['text','muted','accent','focus']) for (const bg of ['bg','surface','surface-raised']) assert.ok(contrast(color(fg),color(bg)) >= 4.5, fg + ' on ' + bg);
  assert.ok(contrast(color('on-accent'),color('accent')) >= 4.5);
  assert.ok(contrast(color('border'),color('surface')) >= 3);
});
test('light theme core token pairs meet WCAG AA contrast', () => {
  const block = css.split(":root[data-theme='light']")[1];
  const light = name => block.match(new RegExp('--color-' + name + ': (#[a-f0-9]{6})'))[1];
  for (const fg of ['text', 'muted', 'accent', 'focus']) for (const bg of ['bg', 'surface', 'surface-raised']) assert.ok(contrast(light(fg), light(bg)) >= 4.5, fg + ' on light ' + bg);
  assert.ok(contrast(light('on-accent'), light('accent')) >= 4.5);
  assert.ok(contrast(light('border'), light('surface')) >= 3);
});
