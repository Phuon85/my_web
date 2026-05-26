package com.humg.olympic.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExerciseResponse {
    private Long   id;
    private String title;
    private String description;
    private String subject;
    private String level;
    private String type;
    private Integer durationMinutes;
    private Boolean isPublished;
    private Boolean allowRetake;
    private String  creatorName;
    private Integer questionCount;
    private Long    submissionCount;
    private List<QuestionResponse> questions;
    private LocalDateTime createdAt;
    private MyResultSummary myResult;
}
