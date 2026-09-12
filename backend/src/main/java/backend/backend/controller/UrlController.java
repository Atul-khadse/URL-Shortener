package backend.backend.controller;


import backend.backend.dto.PageResponse;
import backend.backend.dto.ShortenRequest;
import backend.backend.dto.UrlResponse;
import backend.backend.service.RateLimitingService;
import backend.backend.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/urls")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;
    private final RateLimitingService rateLimitingService;

    @PostMapping
    public ResponseEntity<UrlResponse> shortenUrl(
            @RequestAttribute("userId") Long userId,
            @Valid @RequestBody ShortenRequest request,
            HttpServletRequest servletRequest) {

        String clientIp = servletRequest.getRemoteAddr();
        if (!rateLimitingService.tryConsume("rate:" + clientIp)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded. Try again in 1 minute.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(urlService.shortenUrl(userId, request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<UrlResponse>> getUserUrls(
            @RequestAttribute("userId") Long userId,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(urlService.getUserUrls(userId, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUrl(
            @RequestAttribute("userId") Long userId,
            @PathVariable Long id) {
        urlService.deleteUrl(userId, id);
        return ResponseEntity.noContent().build();
    }
}
