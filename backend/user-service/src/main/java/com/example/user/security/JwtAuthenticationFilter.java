package com.example.user.security;


import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;

    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Lấy token từ header "Authorization"
        String token = request.getHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);  // Xóa "Bearer " khỏi token

            String username = jwtTokenUtil.extractUsername(token);

            // Kiểm tra nếu token hợp lệ
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Tạo đối tượng Authentication cho Spring Security
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(username, null, null);

                // Đặt đối tượng authentication vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // Tiếp tục với filter chain
        filterChain.doFilter(request, response);
    }
}
