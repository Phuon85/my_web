package com.humg.olympic.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ActivityLogResponse {
    private Long   id;
    private String userName;
    private String userEmail;
    private String action;
    private String entityType;
    private Long   entityId;
    private String detail;
    private String ipAddress;
    private LocalDateTime createdAt;
}