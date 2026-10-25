package com.nobi.racing;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.postgresql.PostgreSQLContainer;
import static org.junit.jupiter.api.Assertions.*;

class DatabaseIT {
    @Test void migratesFreshDatabaseAndEnforcesConstraints() throws Exception {
        try (var postgres = new PostgreSQLContainer("postgres:18.6-alpine").withDatabaseName("nobi_mock").withUsername("nobi_mock").withPassword(java.util.UUID.randomUUID().toString())) {
            postgres.start();
            var flyway = Flyway.configure().dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()).load();
            assertEquals(1, flyway.migrate().migrationsExecuted);
            assertEquals(0, flyway.migrate().migrationsExecuted);
            flyway.validate();
            try (var connection = DriverManager.getConnection(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()); var sql = connection.createStatement()) {
                assertThrows(SQLException.class, () -> sql.executeUpdate("INSERT INTO app_user (issuer, subject, locale) VALUES ('mock', 'invalid', 'fr')"));
                sql.executeUpdate("INSERT INTO series (code, name) VALUES ('MOCK', 'MOCK sample series')");
                assertThrows(SQLException.class, () -> sql.executeUpdate("INSERT INTO season (series_id, year) SELECT id, 1800 FROM series WHERE code = 'MOCK'"));
                assertThrows(SQLException.class, () -> sql.executeUpdate("INSERT INTO series (code, name) VALUES ('MOCK', 'duplicate')"));
            }
        }
    }
}
