////package com.example.user.config;
////
////import java.util.Arrays;
////
////import org.springframework.context.annotation.Bean;
////import org.springframework.context.annotation.Configuration;
////import org.springframework.web.cors.CorsConfiguration;
////import org.springframework.web.cors.reactive.CorsWebFilter;
////import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
////
////@Configuration
////public class Config {
////
////    @Bean
////    public CorsWebFilter corsWebFilter() {
////        CorsConfiguration config = new CorsConfiguration();
////        config.setAllowCredentials(true);
////        config.addAllowedOrigin("http://localhost:3000");
////        config.addAllowedHeader("*");
////        config.addAllowedMethod("*");
////
////        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
////        source.registerCorsConfiguration("/**", config);
////
////        return new CorsWebFilter(source);
////    }
////}
//
//
//
//package com.example.user.config;
//
//import java.util.Collections;
//
//import org.springframework.cloud.client.loadbalancer.LoadBalanced;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//@Configuration
//public class Config implements WebMvcConfigurer {
//
//    @Bean
//    @LoadBalanced
//    public RestTemplate restTemplate() {
//    	ObjectMapper objectMapper = new ObjectMapper();
//        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter(objectMapper);
//        return new RestTemplate(Collections.singletonList(converter));
//        
//    }
//    // Cấu hình CORS toàn bộ ứng dụng
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**")  // Định nghĩa các endpoint bạn muốn cho phép
//                .allowedOrigins("http://localhost:8081","http://192.168.1.167:3000","http://localhost:3000")  // Cho phép yêu cầu từ http://localhost:3000 (frontend React)
//                .allowedMethods("GET", "POST", "PUT", "DELETE")  // Các phương thức HTTP cho phép
//                .allowedHeaders("*")  // Cho phép tất cả các header
//                .allowCredentials(true);  // Cho phép gửi cookies (nếu cần)
//    }
//    
//}
