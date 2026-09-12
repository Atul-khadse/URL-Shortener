package backend.backend.dto;



public record AuthResponse(
        String token,
        String email,
        String role
) {}
