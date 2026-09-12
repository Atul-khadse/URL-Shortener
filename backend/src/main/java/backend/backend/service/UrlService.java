package backend.backend.service;




import backend.backend.dto.PageResponse;
import backend.backend.dto.ShortenRequest;
import backend.backend.dto.UrlResponse;
import backend.backend.model.Url;
import backend.backend.model.User;
import backend.backend.repository.UrlRepository;
import backend.backend.repository.UserRepository;
import backend.backend.util.Base62;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.base-url}")
    private String baseUrl;

    private static final String REDIS_PREFIX = "url:";

    @Transactional
    public UrlResponse shortenUrl(Long userId, ShortenRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String shortCode;
        if (request.customAlias() != null && !request.customAlias().isBlank()) {
            if (urlRepository.existsByShortCode(request.customAlias())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Custom alias already taken");
            }
            shortCode = request.customAlias();
        } else {
            // Generate unique Base62 token
            do {
                shortCode = Base62.generateRandomCode(7);
            } while (urlRepository.existsByShortCode(shortCode));
        }

        Url url = Url.builder()
                .user(user)
                .originalUrl(request.originalUrl())
                .shortCode(shortCode)
                .build();

        Url saved = urlRepository.save(url);

        // Pre-warm Redis Cache with 1-Day TTL
        redisTemplate.opsForValue().set(REDIS_PREFIX + shortCode, saved.getOriginalUrl(), Duration.ofDays(1));

        return mapToResponse(saved);
    }

    public String resolveUrl(String shortCode) {
        String cacheKey = REDIS_PREFIX + shortCode;

        // 1. Check Redis Cache
        String cachedOriginalUrl = redisTemplate.opsForValue().get(cacheKey);
        if (cachedOriginalUrl != null) {
            asyncIncrementClick(shortCode);
            return cachedOriginalUrl;
        }

        // 2. Cache miss: Check PostgreSQL
        Url url = urlRepository.findByShortCode(shortCode)
                .filter(Url::getIsActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Short URL not found or inactive"));

        // 3. Write-back to Redis with 1-Day TTL
        redisTemplate.opsForValue().set(cacheKey, url.getOriginalUrl(), Duration.ofDays(1));

        asyncIncrementClick(shortCode);
        return url.getOriginalUrl();
    }

    @Transactional(readOnly = true)
    public PageResponse<UrlResponse> getUserUrls(Long userId, Pageable pageable) {
        Page<Url> page = urlRepository.findAllByUserId(userId, pageable);
        return new PageResponse<>(
                page.getContent().stream().map(this::mapToResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional
    public void deleteUrl(Long userId, Long urlId) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "URL not found"));

        if (!url.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized deletion");
        }

        redisTemplate.delete(REDIS_PREFIX + url.getShortCode());
        urlRepository.delete(url);
    }

    @Async
    @Transactional
    public void asyncIncrementClick(String shortCode) {
        urlRepository.incrementClickCount(shortCode);
    }

    private UrlResponse mapToResponse(Url url) {
        return new UrlResponse(
                url.getId(),
                url.getOriginalUrl(),
                url.getShortCode(),
                baseUrl + "/" + url.getShortCode(),
                url.getClickCount(),
                url.getIsActive(),
                url.getCreatedAt()
        );
    }
}
