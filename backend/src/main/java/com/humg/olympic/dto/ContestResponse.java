package com.humg.olympic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContestResponse {
    private Long id;
    private String title;
    private String description;
    private String subject;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private String prizeFirst;
    private String prizeSecond;
    private String prizeThird;
    private Boolean isPublished;
    private Integer registrantCount;
    private String creatorName;
    private LocalDateTime createdAt;
}
