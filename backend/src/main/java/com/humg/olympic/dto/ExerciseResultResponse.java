package com.humg.olympic.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExerciseResultResponse {
    private Long   submissionId;
    private Double score;
    private Double totalScore;
    private Integer correctCount;
    private Integer totalQuestion;
    private Integer timeSpent;
    private String  status;
    private Map<String, Object> answers;
    private LocalDateTime submittedAt;
}
