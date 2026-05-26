package com.humg.olympic.dto;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateExerciseRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    private String description;
    private String subject;
    @Builder.Default private String level = "MEDIUM";
    @Builder.Default private String type  = "QUIZ";
    @Min(1) @Max(300) private Integer durationMinutes;
    @Builder.Default private Boolean isPublished = false;
    @Builder.Default private Boolean allowRetake  = true;
}
