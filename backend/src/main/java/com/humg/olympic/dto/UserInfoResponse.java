package com.humg.olympic.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private Long id;
    private String fullName;
    private String email;
    private String mssv;
    private String role;
    private String avatarUrl;
    private String lop;
    private String khoa;
    private String truong;
    private Integer totalScore;
    private Integer rank;
    private Boolean isInternal;
    private Boolean isActive;        // ← thêm mới
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // ← thêm mới (dùng làm lastLoginAt tạm)
}
