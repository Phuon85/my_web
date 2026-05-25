package com.humg.olympic.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateTeamRequest {
    private String name;
    private String subject;
    private String description;
    private String avatarUrl;
    private Long   coachId;
    private Boolean isActive;
}