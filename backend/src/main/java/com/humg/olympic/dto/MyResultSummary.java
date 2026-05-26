package com.humg.olympic.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MyResultSummary {
    private Double  score;
    private Double  totalScore;
    private Integer correctCount;
    private Integer totalQuestion;
    private Integer timeSpent;
}
