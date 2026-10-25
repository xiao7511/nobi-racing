// Generated from OpenAPI. Run pnpm api:client:generate; do not edit.
export interface ApiSchemas {
  "Circuit": { "id": string; "name": string; "countryCode": string; "timeZone": string; "lengthKm": string | null; "turns": number | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "CircuitDetailV2": { "data": ApiSchemas["Circuit"]; "dataMode": "mock" | "licensed"; };
  "CircuitPageV2": { "items": Array<ApiSchemas["Circuit"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "Driver": { "id": string; "name": string; "countryCode": string | null; "carNumber": number | null; "biography": string | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "DriverDetailV2": { "data": ApiSchemas["Driver"]; "dataMode": "mock" | "licensed"; };
  "DriverPageV2": { "items": Array<ApiSchemas["Driver"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "Phase2Provenance": { "sourceId": string; "sourceCode": string; "mode": "mock" | "licensed"; "fetchedAt": string; "attribution": string; "timeZone": string; };
  "Problem": { "type": string; "title": string; "status": number; "code": string; "traceId": string; };
  "RaceEvent": { "id": string; "name": string; "seasonId": string; "circuitId": string; "round": number; "startsAt": string; "status": "scheduled" | "completed" | "cancelled"; "laps": number | null; "revision": number; "timeZone": string; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "RaceEventDetailV2": { "data": ApiSchemas["RaceEvent"]; "dataMode": "mock" | "licensed"; };
  "RaceEventPageV2": { "items": Array<ApiSchemas["RaceEvent"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "RaceSession": { "id": string; "raceId": string; "kind": "practice" | "qualifying" | "sprint" | "race"; "sequence": number; "startsAt": string; "endsAt": string | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "RaceSessionPageV2": { "items": Array<ApiSchemas["RaceSession"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "Readiness": { "status": "ready" | "degraded" | "unavailable"; "phase": "2"; "dataMode": "mock"; "database": "up" | "down"; "cache": "up" | "down" | "disabled"; };
  "Season": { "id": string; "year": number; "seriesCode": string; "seriesName": string; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "SeasonDetailV2": { "data": ApiSchemas["Season"]; "dataMode": "mock" | "licensed"; };
  "SeasonEntry": { "id": string; "seasonId": string; "driverId": string; "teamId": string; "carNumber": number | null; "fromRound": number; "toRound": number | null; "driverName": string; "teamName": string; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "SeasonEntryPageV2": { "items": Array<ApiSchemas["SeasonEntry"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "SeasonPageV2": { "items": Array<ApiSchemas["Season"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "SessionResult": { "id": string; "sessionId": string; "raceId": string; "driverId": string; "teamId": string; "driverName": string; "teamName": string; "position": number | null; "resultStatus": "classified" | "dnf" | "dns" | "dsq"; "points": string; "elapsedMs": number | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "SessionResultPageV2": { "items": Array<ApiSchemas["SessionResult"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "StandingRow": { "id": string; "snapshotId": string; "seasonId": string; "afterRaceId": string | null; "capturedAt": string; "snapshotRevision": number; "position": number; "points": string; "wins": number; "name": string; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "StandingRowPageV2": { "items": Array<ApiSchemas["StandingRow"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
  "Team": { "id": string; "name": string; "countryCode": string | null; "provenance": ApiSchemas["Phase2Provenance"]; "dataStatus": "synthetic" | "current" | "stale" | "corrected"; "updatedAt": string; };
  "TeamDetailV2": { "data": ApiSchemas["Team"]; "dataMode": "mock" | "licensed"; };
  "TeamPageV2": { "items": Array<ApiSchemas["Team"]>; "nextCursor": string | null; "snapshotVersion": string; "snapshotId": string | null; "dataMode": "mock" | "licensed" | "mixed" | "empty"; };
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
  "/api/v1/seasons/{id}/entries": "SeasonEntryPageV2"
} as const;
