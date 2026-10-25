/** Phase 0 draft. OpenAPI is authoritative; generate DTOs after contract review. */
export type DataMode = 'mock' | 'licensed';
export interface Provenance { sourceId: string; mode: DataMode; fetchedAt: string; attribution: string; }
export interface RaceSummary { id: string; name: string; startsAt: string; timeZone: string; status: 'scheduled' | 'completed' | 'cancelled'; provenance: Provenance; }
export interface SourceGrant { sourceId: string; status: 'approved' | 'pending' | 'revoked'; enabled: boolean; validFrom: string; validUntil: string; capabilities: readonly string[]; territories: readonly string[]; }
export function canUseSource(grant: SourceGrant, capability: string, territory: string, now: Date): boolean {
  return grant.enabled && grant.status === 'approved' && Date.parse(grant.validFrom) <= now.getTime() && Date.parse(grant.validUntil) > now.getTime() && grant.capabilities.includes(capability) && grant.territories.includes(territory);
}
