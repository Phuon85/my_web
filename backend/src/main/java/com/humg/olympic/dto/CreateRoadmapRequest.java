package com.humg.olympic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateRoadmapRequest {
    @NotBlank(message = "Vui lòng nhập tiêu đề lộ trình")
    private String title;
    private String description;
    private String subject;
}
