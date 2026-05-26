package com.humg.olympic.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateQuestionRequest {
    @NotBlank private String type;
    @Builder.Default private String level = "MEDIUM";
    @NotBlank private String content;
    private String imageUrl;
    private List<String> choices;
    private Object correctAnswer;
    @Builder.Default private Double score = 1.0;
    private String hint;
}
