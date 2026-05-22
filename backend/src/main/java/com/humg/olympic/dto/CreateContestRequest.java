package com.humg.olympic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateContestRequest {

    @NotBlank(message = "Vui lòng nhập tên cuộc thi")
    private String title;

    private String description;
    private String subject;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String prizeFirst;
    private String prizeSecond;
    private String prizeThird;
}
