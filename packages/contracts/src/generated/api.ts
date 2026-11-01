// Generated from OpenAPI. Run pnpm api:client:generate; do not edit.
export interface ApiSchemas {
  "Circuit": { "id": string; "name": string; "countryCode": string; "timeZone": string; "lengthKm": string | null; "turns": number | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "CircuitDetailV2": { "data": ApiSchemas["Circuit"]; "dataMode": "mock" | "licensed"; };
  "CircuitPageV2": { "items": Array<ApiSchemas["Circuit"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "Driver": { "id": string; "name": string; "countryCode": string | null; "carNumber": number | null; "biography": string | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "DriverDetailV2": { "data": ApiSchemas["Driver"]; "dataMode": "mock" | "licensed"; };
  "DriverPageV2": { "items": Array<ApiSchemas["Driver"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "LatestNewsItem": { "title": string; "url": string; "publishedAt": string | null; "summary": string; "titleZh": string | null; "summaryZh": string | null; "translationStatus": "machine" | "edited" | "unavailable" | "original"; };
  "LatestNewsResponse": { "status": "ready" | "pending" | "upstream_error" | "disabled"; "sourceName": "BBC Sport" | "NOBI Racing"; "sourceUrl": "https://www.bbc.co.uk/sport/formula1" | "https://github.com/f1db/f1db"; "termsUrl": "https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds" | "https://creativecommons.org/licenses/by/4.0/"; "usage": "personal-local-only" | "public-open-data"; "checkedAt": string | null; "syncedAt": string | null; "expiresAt": string | null; "sourceUpdatedAt": string | null; "newestPublishedAt": string | null; "items": Array<ApiSchemas["LatestNewsItem"]>; };
  "OfficialNewsItem": { "title": string; "url": string; "publishedAt": string | null; };
  "OfficialNewsResponse": { "sources": Array<ApiSchemas["OfficialNewsSource"]>; };
  "OfficialNewsSource": { "id": "formula1" | "fia"; "name": string; "homepage": string; "status": "ready" | "rights_required" | "pending" | "upstream_error"; "syncedAt": string | null; "expiresAt": string | null; "items": Array<ApiSchemas["OfficialNewsItem"]>; };
  "OpenCatalog": { "status": "ready" | "pending" | "upstream_error" | "disabled"; "license": "CC0 1.0"; "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/"; "syncedAt": string | null; "expiresAt": string | null; "items": Array<ApiSchemas["OpenCatalogEntry"]>; };
  "OpenCatalogEntry": { "id": "Q173365" | "Q9673" | "Q2239218"; "name": string; "nameZh": string; "description": string; "descriptionZh": string; "sourceUrl": string; "sourceUpdatedAt": string; "revision": number; };
  "Phase2Provenance": { "sourceId": string; "sourceCode": string; "mode": "mock" | "licensed"; "fetchedAt": string; "attribution": string; "timeZone": string; };
  "Problem": { "type": string; "title": string; "status": number; "code": string; "traceId": string; };
  "RaceEvent": { "id": string; "name": string; "seasonId": string; "circuitId": string; "round": number; "startsAt": string; "status": "scheduled" | "completed" | "cancelled"; "laps": number | null; "revision": number; "timeZone": string; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "RaceEventDetailV2": { "data": ApiSchemas["RaceEvent"]; "dataMode": "mock" | "licensed"; };
  "RaceEventPageV2": { "items": Array<ApiSchemas["RaceEvent"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "RaceSession": { "id": string; "raceId": string; "kind": "practice" | "qualifying" | "sprint" | "race"; "sequence": number; "startsAt": string; "endsAt": string | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "RaceSessionPageV2": { "items": Array<ApiSchemas["RaceSession"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "RaceWeekend": { "id": number; "name": string; "nameZh": string; "circuit": string; "circuitZh": string; "location": string; "locationZh": string; "startsAt": string; "endsAt": string; "gmtOffset": string; "cancelled": boolean; "sprint": boolean; "sessions": Array<ApiSchemas["WeekendSession"]>; };
  "Readiness": { "status": "ready" | "degraded" | "unavailable"; "phase": "2"; "dataMode": "mock"; "database": "up" | "down"; "cache": "up" | "down" | "disabled"; };
  "Season": { "id": string; "year": number; "seriesCode": string; "seriesName": string; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "SeasonDetailV2": { "data": ApiSchemas["Season"]; "dataMode": "mock" | "licensed"; };
  "SeasonEntry": { "id": string; "seasonId": string; "driverId": string; "teamId": string; "carNumber": number | null; "fromRound": number; "toRound": number | null; "driverName": string; "teamName": string; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "SeasonEntryPageV2": { "items": Array<ApiSchemas["SeasonEntry"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "SeasonInsightEntry": { "id": string; "name": string; "team": string; "color": string; "position": number; "positionStart": number | null; "points": string; "pointsStart": string; };
  "SeasonInsightRound": { "id": number; "meetingId": number; "circuit": string; "circuitZh": string; "endsAt": string; "drivers": Array<ApiSchemas["SeasonInsightEntry"]>; "teams": Array<ApiSchemas["SeasonInsightEntry"]>; };
  "SeasonInsightsResponse": { "status": "ready" | "empty" | "pending" | "upstream_error" | "disabled"; "year": 2026; "source": "OpenF1" | "F1DB"; "sourceUrl": "https://openf1.org/" | "https://github.com/f1db/f1db"; "license": "CC BY-NC-SA 4.0" | "CC BY 4.0"; "licenseUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/" | "https://creativecommons.org/licenses/by/4.0/"; "syncedAt": string | null; "expiresAt": string | null; "rounds": Array<ApiSchemas["SeasonInsightRound"]>; };
  "SeasonPageV2": { "items": Array<ApiSchemas["Season"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "SessionResult": { "id": string; "sessionId": string; "raceId": string; "driverId": string; "teamId": string; "driverName": string; "teamName": string; "position": number | null; "resultStatus": "classified" | "dnf" | "dns" | "dsq"; "points": string; "elapsedMs": number | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "SessionResultPageV2": { "items": Array<ApiSchemas["SessionResult"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "StandingRow": { "id": string; "snapshotId": string; "seasonId": string; "afterRaceId": string | null; "capturedAt": string; "snapshotRevision": number; "position": number; "points": string; "wins": number; "name": string; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "StandingRowPageV2": { "items": Array<ApiSchemas["StandingRow"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "Team": { "id": string; "name": string; "countryCode": string | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "TeamDetailV2": { "data": ApiSchemas["Team"]; "dataMode": "mock" | "licensed"; };
  "TeamPageV2": { "items": Array<ApiSchemas["Team"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "WeekendSession": { "id": number; "name": string; "kind": "practice1" | "practice2" | "practice3" | "qualifying" | "sprintQualifying" | "sprint" | "race" | "other"; "startsAt": string; "endsAt": string; "endEstimated"?: boolean; };
  "WeekendsResponse": { "status": "ready" | "pending" | "upstream_error" | "disabled"; "year": 2026; "source": "OpenF1" | "F1DB"; "sourceUrl": "https://openf1.org/" | "https://github.com/f1db/f1db"; "license": "CC BY-NC-SA 4.0" | "CC BY 4.0"; "licenseUrl": "https://creativecommons.org/licenses/by-nc-sa/4.0/" | "https://creativecommons.org/licenses/by/4.0/"; "syncedAt": string | null; "expiresAt": string | null; "items": Array<ApiSchemas["RaceWeekend"]>; };
}
export interface ApiResponses {
  "/api/v1/readiness": ApiSchemas["Readiness"];
  "/api/v1/races": ApiSchemas["RaceEventPageV2"];
  "/api/v1/races/{id}": ApiSchemas["RaceEventDetailV2"];
  "/api/v1/standings": ApiSchemas["StandingRowPageV2"];
  "/api/v1/seasons": ApiSchemas["SeasonPageV2"];
  "/api/v1/seasons/{id}": ApiSchemas["SeasonDetailV2"];
  "/api/v1/circuits": ApiSchemas["CircuitPageV2"];
  "/api/v1/circuits/{id}": ApiSchemas["CircuitDetailV2"];
  "/api/v1/drivers": ApiSchemas["DriverPageV2"];
  "/api/v1/drivers/{id}": ApiSchemas["DriverDetailV2"];
  "/api/v1/teams": ApiSchemas["TeamPageV2"];
  "/api/v1/teams/{id}": ApiSchemas["TeamDetailV2"];
  "/api/v1/races/{id}/sessions": ApiSchemas["RaceSessionPageV2"];
  "/api/v1/sessions/{id}/results": ApiSchemas["SessionResultPageV2"];
  "/api/v1/seasons/{id}/entries": ApiSchemas["SeasonEntryPageV2"];
  "/api/v1/official-news": ApiSchemas["OfficialNewsResponse"];
  "/api/v1/open-catalog": ApiSchemas["OpenCatalog"];
  "/api/v1/latest-news": ApiSchemas["LatestNewsResponse"];
  "/api/v1/weekends": ApiSchemas["WeekendsResponse"];
  "/api/v1/season-insights": ApiSchemas["SeasonInsightsResponse"];
}
export const responseSchemas = {
  "/api/v1/readiness": "Readiness",
  "/api/v1/races": "RaceEventPageV2",
  "/api/v1/races/{id}": "RaceEventDetailV2",
  "/api/v1/standings": "StandingRowPageV2",
  "/api/v1/seasons": "SeasonPageV2",
  "/api/v1/seasons/{id}": "SeasonDetailV2",
  "/api/v1/circuits": "CircuitPageV2",
  "/api/v1/circuits/{id}": "CircuitDetailV2",
  "/api/v1/drivers": "DriverPageV2",
  "/api/v1/drivers/{id}": "DriverDetailV2",
  "/api/v1/teams": "TeamPageV2",
  "/api/v1/teams/{id}": "TeamDetailV2",
  "/api/v1/races/{id}/sessions": "RaceSessionPageV2",
  "/api/v1/sessions/{id}/results": "SessionResultPageV2",
  "/api/v1/seasons/{id}/entries": "SeasonEntryPageV2",
  "/api/v1/official-news": "OfficialNewsResponse",
  "/api/v1/open-catalog": "OpenCatalog",
  "/api/v1/latest-news": "LatestNewsResponse",
  "/api/v1/weekends": "WeekendsResponse",
  "/api/v1/season-insights": "SeasonInsightsResponse"
} as const;
