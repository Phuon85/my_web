package com.humg.olympic.dto;
import lombok.*;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor
public class SubmitExerciseRequest {
    private Map<String, Object> answers;
    private Integer timeSpent;
    private Integer tabSwitchCount;
}
