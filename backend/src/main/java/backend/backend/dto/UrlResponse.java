package backend.backend.dto;


import java.time.Instant;

public record UrlResponse(
        Long id,
        String originalUrl,
        String shortCode,
        String fullShortUrl,
        Long clickCount,
        Boolean isActive,
        Instant createdAt
) {}
