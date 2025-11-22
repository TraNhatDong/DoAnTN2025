//package com.example.user.service;
//
//import com.example.user.entity.Users;
//import com.example.user.repository.UserRepository;
//import com.example.user.security.JwtTokenUtil;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.stereotype.Service;
//
//@Service
//public class AuthService {
//
//    @Autowired
//    private UserRepository usersRepository;
//
//    @Autowired
//    private JwtTokenUtil jwtTokenUtil;
//
//    @Autowired
//    private AuthenticationManager authenticationManager;
//
//    public String login(String username, String password) {
//        // Xác thực người dùng với username và password
//        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
//        authenticationManager.authenticate(authenticationToken);  // Sử dụng AuthenticationManager để xác thực
//
//        // Sau khi xác thực thành công, tạo JWT
//        Users user = usersRepository.findByEmail(username)
//                                    .orElseThrow(() -> new RuntimeException("User not found"));
//        return jwtTokenUtil.generateToken(user.getEmail());  // Trả về token JWT
//    }
//}
