package com.nobi.racing;

import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Clock;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class LocalDemo implements ApplicationRunner {
    public static final UUID SOURCE=UUID.nameUUIDFromBytes("nobi:synthetic:source".getBytes(StandardCharsets.UTF_8));
    private final JdbcTemplate jdbc; private final TransactionTemplate transactions; private final Clock clock; private final SyncService sync;
    private final Environment environment; private final boolean seed,onStart;
    public LocalDemo(JdbcTemplate jdbc,TransactionTemplate transactions,Clock clock,SyncService sync,Environment environment,@Value("${nobi.demo.seed}") boolean seed,@Value("${nobi.sync.on-start}") boolean onStart) {
        this.jdbc=jdbc;this.transactions=transactions;this.clock=clock;this.sync=sync;this.environment=environment;this.seed=seed;this.onStart=onStart;
    }
    @Override public void run(ApplicationArguments arguments) {
        if(seed && !java.util.Arrays.asList(environment.getActiveProfiles()).contains("local")) throw new IllegalStateException("Synthetic seeding requires the local profile");
        if(seed) seed();
        if(onStart) sync.synchronize(SOURCE);
    }
    public void seed() {
        transactions.executeWithoutResult(status -> {
            if(Integer.valueOf(1).equals(jdbc.queryForObject("SELECT count(*) FROM data_source WHERE id=?",Integer.class,SOURCE))) return;
            UUID author=UUID.nameUUIDFromBytes("nobi:synthetic:author".getBytes(StandardCharsets.UTF_8));
            UUID reviewer=UUID.nameUUIDFromBytes("nobi:synthetic:reviewer".getBytes(StandardCharsets.UTF_8));
            jdbc.update("INSERT INTO app_user(id,issuer,subject) VALUES (?,'urn:nobi:synthetic','author'),(?,'urn:nobi:synthetic','reviewer') ON CONFLICT DO NOTHING",author,reviewer);
            jdbc.update("INSERT INTO user_role(user_id,role) VALUES (?,'source_manager'),(?,'source_manager') ON CONFLICT DO NOTHING",author,reviewer);
            jdbc.update("INSERT INTO data_source(id,code,name,mode,attribution,enabled) VALUES (?,'NOBI_SYNTHETIC','Original synthetic fixtures','mock','NOBI original synthetic data · MOCK',true) ON CONFLICT DO NOTHING",SOURCE);
            UUID grant=UUID.nameUUIDFromBytes("nobi:synthetic:grant".getBytes(StandardCharsets.UTF_8));
            jdbc.update("INSERT INTO source_grant(id,source_id,status,capabilities,territories,evidence_ref,valid_from,valid_until,retention_days,created_by,approved_by,evidence_verified) VALUES (?,?,'approved',ARRAY['catalog','schedule','results','standings','redistribution','offline_cache'],ARRAY['LOCAL'],'urn:nobi:synthetic-fixtures:v1',?,?,30,?,?,true) ON CONFLICT DO NOTHING",grant,SOURCE,Timestamp.from(clock.instant().minusSeconds(60)),Timestamp.from(clock.instant().plusSeconds(2592000)),author,reviewer);
        });
    }
}
