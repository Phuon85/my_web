package com.humg.olympic.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long activeUsers;
    private long totalContests;
    private long liveContests;
    private long totalDocuments;
    private long totalRoadmaps;
    private long totalRegistrations;
}