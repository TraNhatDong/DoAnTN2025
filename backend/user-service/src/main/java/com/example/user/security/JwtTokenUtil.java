package com.example.user.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import com.example.user.entity.Role;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenUtil {

    private final String secretKey = "YourVeryStrongSecretKeyHereWithAtLeast32Characters123";  // Nên thay đổi key này thành key bảo mật hơn
    private final SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

    // Trích xuất tất cả claims từ token
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Lấy username từ token
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // Lấy thông tin người dùng từ token
    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    public String extractFirstName(String token) {
        return extractClaims(token).get("firstName", String.class);
    }

    public String extractLastName(String token) {
        return extractClaims(token).get("lastName", String.class);
    }

    public String extractEmail(String token) {
        return extractClaims(token).get("email", String.class);
    }
    
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }


    // Kiểm tra token đã hết hạn chưa
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // Tạo token từ thông tin người dùng
    public String generateToken(String username, Long userId, String firstName, String lastName, String email,Role role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("firstName", firstName);
        claims.put("lastName", lastName);
        claims.put("email", email);
        claims.put("role", role);
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Token có hiệu lực 10 giờ
                .signWith(key)
                .compact();
    }

     //Xác thực token (bỏ comment nếu cần)
     public boolean validateToken(String token, String username) {
         return (username.equals(extractUsername(token)) && !isTokenExpired(token));
     }
}