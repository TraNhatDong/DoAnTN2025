package com.example.user.controller;

import com.example.user.entity.UserAccount;
import com.example.user.entity.Users;
import com.example.user.repository.UserAccountRepository;
import com.example.user.security.JwtTokenUtil;
import com.example.user.DTO.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        logger.info("Login attempt with username: {}", request.getUsername());
        UserAccount user = userAccountRepository.findByUsername(request.getUsername());

       if (user == null || !user.getPassword().equals(request.getPassword())) {
    logger.warn("Failed login attempt for username: {}", request.getUsername());
    Map<String, String> errorResponse = new HashMap<>();
    errorResponse.put("error", "Sai tài khoản hoặc mật khẩu");
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
}


        Users userInfo = user.getUser(); // Lấy thông tin người dùng từ bảng Users

        logger.info("Successfully logged in, userId: {}, role: {}", userInfo.getUserId(), user.getRole().name());
        String token = jwtTokenUtil.generateToken(
                user.getUsername(),
                userInfo.getUserId(),
                userInfo.getFirstName(),
                userInfo.getLastName(),
                userInfo.getEmail(),
                user.getRole());
        logger.info("Generated token for username: {}", user.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("msg", "Đăng nhập thành công");
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("username", user.getUsername());
        response.put("userId", userInfo.getUserId());
        response.put("firstName", userInfo.getFirstName());
        response.put("lastName", userInfo.getLastName());
        response.put("email", userInfo.getEmail());

        return ResponseEntity.ok(response);

    }
}
