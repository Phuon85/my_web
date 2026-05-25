package com.humg.olympic.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TeamResponse {
    private Long   id;
    private String name;
    private String subject;
    private String description;
    private String avatarUrl;
    private Boolean isActive;
    private Long   coachId;
    private String coachName;
    private String coachEmail;
    private int memberCount;
    private List<TeamMemberResponse> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}