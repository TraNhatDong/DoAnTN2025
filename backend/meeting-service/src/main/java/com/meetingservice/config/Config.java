// package com.meetingservice.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.reactive.CorsWebFilter;
// import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

// @Configuration
// public class Config {

//     @Bean
//     public CorsWebFilter corsWebFilter() {
//         CorsConfiguration config = new CorsConfiguration();
//         config.setAllowCredentials(true);
//         config.addAllowedOrigin("http://192.168.1.167:3000"); // ✅ React client
//         config.addAllowedOrigin("http://localhost:5173/"); // ✅ React client
//         config.addAllowedHeader("*");
//         config.addAllowedMethod("*");

//         // Log configuration to check it
//         System.out.println("CORS Configuration: " + config);

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", config);

//         return new CorsWebFilter(source);
//     }

// }
