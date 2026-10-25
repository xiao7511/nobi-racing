package com.nobi.racing;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static com.nobi.racing.SourceAdapter.*;

class BatchTest {
    private final Batch fixture=new SyntheticAdapter().fetch();
    private final Instant now=Instant.parse("2026-10-25T08:00:00Z");
    @Test void originalFixtureIsCompleteAndValid() { assertDoesNotThrow(() -> BatchValidator.validate(fixture,now)); }
    @Test void partialSnapshotsCannotOverwriteCompleteStandings() {
        Snapshot snapshot=fixture.snapshots().getFirst();
        var missingDriver=new Snapshot(snapshot.externalId(),snapshot.seasonId(),snapshot.afterRaceId(),snapshot.capturedAt(),true,snapshot.drivers().subList(0,3),snapshot.teams());
        assertThrows(ApiFailure.class,() -> BatchValidator.validate(new Batch(fixture.generatedAt(),fixture.entities(),List.of(missingDriver)),now));
        var incomplete=new Snapshot(snapshot.externalId(),snapshot.seasonId(),snapshot.afterRaceId(),snapshot.capturedAt(),false,snapshot.drivers(),snapshot.teams());
        assertThrows(ApiFailure.class,() -> BatchValidator.validate(new Batch(fixture.generatedAt(),fixture.entities(),List.of(incomplete)),now));
    }
    @Test void invalidFieldsDuplicatesAndFuturePayloadsAreRejected() {
        var rows=new ArrayList<>(fixture.entities());rows.add(rows.getFirst());
        final var duplicateRows=rows;
        assertThrows(ApiFailure.class,() -> BatchValidator.validate(new Batch(fixture.generatedAt(),duplicateRows,fixture.snapshots()),now));
        assertThrows(ApiFailure.class,() -> BatchValidator.validate(fixture,fixture.generatedAt().minusSeconds(1)));
        var circuit=fixture.entities().stream().filter(row -> row.kind()==Kind.CIRCUIT).findFirst().orElseThrow();
        var fields=new HashMap<>(circuit.fields());fields.put("time_zone","Not/A_Zone");
        rows=new ArrayList<>(fixture.entities());rows.set(rows.indexOf(circuit),new Datum(circuit.kind(),circuit.externalId(),fields));
        final var invalidRows=rows;
        assertThrows(ApiFailure.class,() -> BatchValidator.validate(new Batch(fixture.generatedAt(),invalidRows,fixture.snapshots()),now));
    }
}
