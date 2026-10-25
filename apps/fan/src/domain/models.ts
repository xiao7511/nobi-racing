import type { Locale } from '@nobi/i18n';
import type { Provenance } from '@nobi/contracts';

export type Localized = Record<Locale, string>;
export interface MockEntity { id: string; provenance: Provenance & { mode: 'mock' }; }
export type NewsCategory = 'all' | 'paddock' | 'engineering' | 'weekend';
export interface Article extends MockEntity {
  title: Localized; summary: Localized; paragraphs: Localized[];
  category: Exclude<NewsCategory, 'all'>; publishedAt: string; readMinutes: number;
  art: 'velocity' | 'circuit' | 'engineering'; author: Localized;
}
export interface Race extends MockEntity {
  name: Localized; location: Localized; circuit: Localized; description: Localized;
  round: number; startsAt: string; timeZone: string;
  status: 'upcoming' | 'completed'; laps: number; lengthKm: string; turns: number;
  sessions: { name: 'practice' | 'qualifying' | 'race'; startsAt: string }[];
}
export interface Driver extends MockEntity {
  name: string; initials: string; number: number; team: string; color: 'coral' | 'mint' | 'blue';
  country: Localized; biography: Localized; points: string; wins: number; podiums: number; starts: number;
}
export interface Standing extends MockEntity { driverId: string; position: number; points: string; wins: number; }
export interface ApiEnvelope<T> { data: T; mode: 'mock'; generatedAt: string; }
export type ResourceStatus = 'loading' | 'ready' | 'empty' | 'error';
