package com.humg.olympic.dto;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AddTeamMemberRequest {
    private Long   userId;
    private String role;
    private String joinNote;
}