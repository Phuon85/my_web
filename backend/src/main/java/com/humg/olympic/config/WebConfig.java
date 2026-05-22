package com.humg.olympic.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Cho phép truy cập file upload qua URL /uploads/ten-file.pdf
     * Ví dụ: http://localhost:8080/uploads/uuid-123.pdf
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + uploadDir + "/");
    }

    /**
     * Cho phép CORS trên toàn bộ controller
     * (SecurityConfig đã xử lý, đây là fallback cho static resources)
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
            .allowedOrigins(
                "http://localhost:3000",
                "https://olympic.humg.edu.vn"
            )
            .allowedMethods("GET");
    }
}
