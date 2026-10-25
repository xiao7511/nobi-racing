import { describe, expect, it } from 'vitest';
import { canUseSource, type SourceGrant } from '../packages/contracts/src/index';
const grant: SourceGrant = { sourceId: 'mock', status: 'approved', enabled: true, validFrom: '2025-01-01T00:00:00Z', validUntil: '2026-01-01T00:00:00Z', capabilities: ['schedule'], territories: ['CN'] };
const before = new Date('2025-12-01T00:00:00Z');
describe('source grants fail closed', () => {
  it('allows only approved scope, territory and unexpired grants', () => {
    expect(canUseSource(grant, 'schedule', 'CN', before)).toBe(true);
    expect(canUseSource({ ...grant, enabled: false }, 'schedule', 'CN', before)).toBe(false);
    expect(canUseSource(grant, 'schedule', 'CN', new Date('2024-01-01T00:00:00Z'))).toBe(false);
    expect(canUseSource(grant, 'live', 'CN', before)).toBe(false);
    expect(canUseSource(grant, 'schedule', 'US', before)).toBe(false);
    expect(canUseSource(grant, 'schedule', 'CN', new Date('2026-01-01T00:00:00Z'))).toBe(false);
    expect(canUseSource({ ...grant, status: 'revoked' }, 'schedule', 'CN', before)).toBe(false);
    expect(canUseSource({ ...grant, status: 'pending' }, 'schedule', 'CN', before)).toBe(false);
    expect(canUseSource({ ...grant, validUntil: 'invalid' }, 'schedule', 'CN', before)).toBe(false);
  });
});
