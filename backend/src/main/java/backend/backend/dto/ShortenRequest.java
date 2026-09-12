package backend.backend.dto;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.URL;

public record ShortenRequest(
        @NotBlank(message = "Original URL is required")
        @URL(message = "Malformed URL provided")
        String originalUrl,

        @Pattern(regexp = "^[a-zA-Z0-9_-]{3,15}$", message = "Alias must be 3-15 alphanumeric characters")
        String customAlias
) {}
