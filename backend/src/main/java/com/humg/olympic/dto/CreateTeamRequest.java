package com.humg.olympic.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateTeamRequest {
    private String name;
    private String subject;
    private String description;
    private String avatarUrl;
    private Long   coachId;
}