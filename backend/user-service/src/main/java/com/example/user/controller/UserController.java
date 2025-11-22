package com.example.user.controller;

import com.example.user.DTO.UserDetailsResponse;
import com.example.user.DTO.UserInfoDTO;
import com.example.user.entity.*;
import com.example.user.security.JwtTokenUtil;
import com.example.user.service.UserAccountService;
import com.example.user.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

	@Autowired
	private UserAccountService userAccountService;

	@Autowired
	private UserService userService;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@GetMapping("/account/{accountID}")
	public ResponseEntity<UserInfoDTO> getInfoUserAndUserAccount(@PathVariable Long accountID) {
		UserInfoDTO userInfoDTO = userService.getUserInfoAndAccountByAccountId(accountID);
		return ResponseEntity.ok(userInfoDTO);
	}
	@GetMapping("/userDetail/{id}")
	public ResponseEntity<Users> getUserByID(@PathVariable Long id) {
		Users user = userService.getUserById(id);
		return ResponseEntity.ok(user);
	}

	// // API lấy thông tin người dùng
	// @GetMapping("/info/{id}")
	// public ResponseEntity<?> getUserInfo(@PathVariable Long id, HttpServletRequest request) {
	// 	// Lấy token từ header Authorization
	// 	String token = request.getHeader("Authorization");

	// 	// Kiểm tra nếu token không tồn tại
	// 	if (token == null || !token.startsWith("Bearer ")) {
	// 		return ResponseEntity.status(401).body("Token không hợp lệ");
	// 	}

	// 	// Lấy JWT token (cắt phần "Bearer " ra khỏi token)
	// 	token = token.substring(7);

	// 	try {
	// 		// Lấy userId từ JWT token
	// 		Long userIdFromToken = jwtTokenUtil.extractUserId(token);
	// 		String roleFromToken = jwtTokenUtil.extractRole(token);
	// 		// Admin được truy cập tất cả, user thường chỉ xem thông tin của chính mình
	//         if (!roleFromToken.equals("ADMIN") && !userIdFromToken.equals(id)) {
	//             return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không có quyền truy cập");
	// 		}

	// 		// Tìm thông tin người dùng trong cơ sở dữ liệu
	// 		Users user = userService.getUserById(id);
	// 		if (user == null) {
	// 			return ResponseEntity.status(404).body("Người dùng không tồn tại");
	// 		}

	// 		return ResponseEntity.ok(user); // Trả về thông tin người dùng

	// 	} catch (Exception e) {
	// 		return ResponseEntity.status(400).body("Lỗi khi giải mã token: " + e.getMessage());
	// 	}
	// }
	// API lấy thông tin người dùng mà không kiểm tra token
@GetMapping("/info/{id}")
public ResponseEntity<?> getUserInfo(@PathVariable Long id) {
    // Tìm thông tin người dùng trong cơ sở dữ liệu
    Users user = userService.getUserById(id);
    
    if (user == null) {
        return ResponseEntity.status(404).body("Người dùng không tồn tại");
    }

    return ResponseEntity.ok(user); // Trả về thông tin người dùng
}

	@GetMapping("/active")
    public ResponseEntity<List<UserDetailsResponse>> getAllActiveUsers() {
        try {
            List<UserDetailsResponse> userDetailsList = userService.getAllActiveUsers();
            
            if (userDetailsList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            return ResponseEntity.ok(userDetailsList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
