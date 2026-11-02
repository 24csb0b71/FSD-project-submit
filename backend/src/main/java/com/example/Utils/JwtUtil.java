package com.example.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key = Keys.hmacShaKeyFor("your-very-long-secret-key-at-least-32-chars".getBytes());

    private final long EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    public String generateToken(String studentId, boolean isAdmin) {
        return Jwts.builder()
                .subject(studentId)
                .claim("isAdmin", isAdmin)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractStudentId(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean extractIsAdmin(String token) {
        Boolean isAdmin = extractAllClaims(token).get("isAdmin", Boolean.class);
        return isAdmin != null ? isAdmin : false;
    }

    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}