package com.humg.olympic.dto;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SubmissionResponse {
    private Long   id;
    private Long   userId;
    private String userName;
    private String userEmail;
    private Double score;
    private Double totalScore;
    private Integer correctCount;
    private Integer totalQuestion;
    private Integer timeSpent;
    private Integer tabSwitchCount;
    private String  status;
    private LocalDateTime submittedAt;
}
