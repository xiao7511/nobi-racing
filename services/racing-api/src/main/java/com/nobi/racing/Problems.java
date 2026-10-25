package com.nobi.racing;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.dao.DataAccessException;
import tools.jackson.databind.ObjectMapper;

@RestControllerAdvice
public class Problems {
    private final ObjectMapper mapper;
    public Problems(ObjectMapper mapper) { this.mapper = mapper; }
    static String trace(HttpServletRequest request) {
        Object value = request.getAttribute("nobi.trace");
        return value == null ? UUID.randomUUID().toString() : value.toString();
    }
    static Map<String,Object> body(int status, String code, HttpServletRequest request) {
        return Map.of("type", "urn:nobi:error:" + code, "title", code.replace('_',' '), "status", status, "code", code, "traceId", trace(request));
    }
    public void write(HttpServletRequest request, HttpServletResponse response, int status, String code) throws IOException {
        response.setStatus(status); response.setContentType("application/problem+json");
        response.setHeader("Cache-Control", "no-store");
        response.getWriter().write(mapper.writeValueAsString(body(status,code,request)));
    }
    @ExceptionHandler(ApiFailure.class)
    ResponseEntity<?> business(ApiFailure error, HttpServletRequest request) { return response(error.status(),error.code(),request); }
    @ExceptionHandler({MethodArgumentTypeMismatchException.class, IllegalArgumentException.class})
    ResponseEntity<?> validation(Exception error, HttpServletRequest request) { return response(400,"VALIDATION_FAILED",request); }
    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<?> missing(Exception error, HttpServletRequest request) { return response(404,"RESOURCE_NOT_FOUND",request); }
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<?> method(Exception error, HttpServletRequest request) { return response(405,"METHOD_NOT_ALLOWED",request); }
    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<?> database(Exception error, HttpServletRequest request) { return response(503,"SOURCE_UNAVAILABLE",request); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<?> unexpected(Exception error, HttpServletRequest request) {
        // Never log provider payloads, SQL, exception messages or credentials.
        org.slf4j.LoggerFactory.getLogger(Problems.class).error("Internal API failure trace={} category={}",trace(request),error.getClass().getSimpleName());
        return response(500,"INTERNAL_ERROR",request);
    }
    private ResponseEntity<?> response(int status, String code, HttpServletRequest request) {
        return ResponseEntity.status(status).header("Content-Type","application/problem+json").header("Cache-Control","no-store").body(body(status,code,request));
    }
}
