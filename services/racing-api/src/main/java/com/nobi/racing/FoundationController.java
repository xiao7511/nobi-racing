package com.nobi.racing;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FoundationController {
    @GetMapping("/api/v1/readiness")
    public Map<String, String> readiness() {
        return Map.of("status", "foundation", "phase", "0", "dataMode", "mock");
    }
}
