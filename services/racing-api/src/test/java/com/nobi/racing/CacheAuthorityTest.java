package com.nobi.racing;

import java.time.Clock;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CacheAuthorityTest {
    @Test void databaseAuthorizationFailureCannotFallBackToCachedFacts() {
        RightsPolicy rights=mock(RightsPolicy.class);RedisSupport redis=mock(RedisSupport.class);
        when(rights.allowed("catalog")).thenThrow(new org.springframework.dao.DataAccessResourceFailureException("database down"));
        var service=new CatalogService(mock(CatalogRepository.class),rights,new SignedCursor(""),redis,JsonMapper.builder().build(),Clock.systemUTC());
        assertThrows(org.springframework.dao.DataAccessException.class,() -> service.list(CatalogRepository.Resource.DRIVERS,"en-US",20,null,java.util.Map.of()));
        verifyNoInteractions(redis);
    }
}
