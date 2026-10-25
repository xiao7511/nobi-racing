package com.nobi.racing;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FoundationTest {
    @LocalServerPort int port;
    private HttpResponse<String> get(String path) throws Exception {
        return HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).GET().build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test void foundationIsExplicitlyMock() throws Exception {
        var response = get("/api/v1/readiness");
        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"dataMode\":\"mock\""));
    }
    @Test void staffRoutesFailClosed() throws Exception {
        var response = get("/api/v1/admin/sources");
        assertEquals(401, response.statusCode());
        assertTrue(response.body().contains("AUTH_REQUIRED"));
    }
}
