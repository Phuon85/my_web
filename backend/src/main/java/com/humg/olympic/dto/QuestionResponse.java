package com.humg.olympic.dto;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class QuestionResponse {
    private Long   id;
    private String type;
    private String level;
    private String content;
    private String imageUrl;
    private List<String> choices;
    private Object correctAnswer;
    private Double score;
    private String hint;
    private Integer orderIndex;
}
