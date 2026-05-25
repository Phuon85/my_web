package com.humg.olympic.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TeamMemberResponse {
    private Long   memberId;
    private Long   userId;
    private String fullName;
    private String email;
    private String mssv;
    private String khoa;
    private String avatarUrl;
    private String memberRole;
    private String joinNote;
    private LocalDateTime joinedAt;
    private Integer totalScore;
}