package com.nobi.racing;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class RightsPolicy {
    public record Permit(UUID sourceId, String code, String mode, String attribution, String timeZone,
                         long dataRevision, UUID grantId, long grantRevision, Instant expiresAt, boolean cacheAllowed, String territory) {}
    public record Grant(boolean enabled, String status, boolean evidenceVerified, boolean reviewerActive,
                        UUID creator, UUID reviewer, Instant from, Instant until, Set<String> capabilities, Set<String> territories) {}
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final String territory;
    public RightsPolicy(JdbcTemplate jdbc, Clock clock, @Value("${nobi.territory}") String territory) { this.jdbc=jdbc; this.clock=clock; this.territory=territory; }
    public static boolean permits(Grant grant, String capability, String territory, Instant now, boolean distribute) {
        return grant.enabled && "approved".equals(grant.status) && grant.evidenceVerified && grant.reviewerActive
            && grant.reviewer != null && !grant.reviewer.equals(grant.creator) && !now.isBefore(grant.from) && now.isBefore(grant.until)
            && grant.capabilities.contains(capability) && (!distribute || grant.capabilities.contains("redistribution")) && grant.territories.contains(territory);
    }
    public List<Permit> allowed(String capability) { return allowed(capability,true); }
    public List<Permit> allowed(String capability, boolean distribute) {
        List<Permit> all = jdbc.query("""
            SELECT s.*,g.id grant_id,g.revision grant_revision,g.status,g.evidence_verified,g.created_by,g.approved_by,
              g.valid_from,g.valid_until,g.capabilities,g.territories,
              EXISTS(SELECT 1 FROM user_role r JOIN app_user u ON u.id=r.user_id WHERE r.user_id=g.approved_by AND r.role='source_manager' AND u.deleted_at IS NULL) reviewer_active
            FROM data_source s JOIN source_grant g ON g.source_id=s.id
            JOIN app_user creator ON creator.id=g.created_by AND creator.deleted_at IS NULL
            ORDER BY s.id,g.valid_until DESC,g.revision DESC,g.id
            """, (r,row) -> {
                Set<String> capabilities=values(r,"capabilities");
                var grant=new Grant(r.getBoolean("enabled"),r.getString("status"),r.getBoolean("evidence_verified"),r.getBoolean("reviewer_active"),
                    r.getObject("created_by",UUID.class),r.getObject("approved_by",UUID.class),r.getTimestamp("valid_from").toInstant(),r.getTimestamp("valid_until").toInstant(),capabilities,values(r,"territories"));
                if (!permits(grant,capability,territory,clock.instant(),distribute)) return null;
                return new Permit(r.getObject("id",UUID.class),r.getString("code"),r.getString("mode"),r.getString("attribution"),r.getString("time_zone"),r.getLong("data_revision"),r.getObject("grant_id",UUID.class),r.getLong("grant_revision"),grant.until,capabilities.contains("offline_cache"),territory);
            });
        // A single complete grant must cover the purpose; do not combine partial grants.
        var seen=new java.util.HashSet<UUID>();
        return all.stream().filter(java.util.Objects::nonNull).filter(p -> seen.add(p.sourceId)).sorted(Comparator.comparing(p -> p.sourceId.toString())).toList();
    }
    private static Set<String> values(ResultSet row,String column) throws SQLException { return Set.copyOf(Arrays.asList((String[])row.getArray(column).getArray())); }
    public Permit require(UUID source, String capability) {
        return allowed(capability,false).stream().filter(p -> p.sourceId.equals(source)).findFirst().orElseThrow(() -> new ApiFailure(403,"SOURCE_NOT_AUTHORIZED"));
    }
    public static String fingerprint(List<Permit> permits) { return Crypto.digest(permits.toString()); }
}
