package com.humg.olympic.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoadmapResponse {
    private Long   id;
    private String title;
    private String description;
    private String subject;
    private String creatorName;
    private List<RoadmapChapterResponse> chapters;
    private LocalDateTime createdAt;
}
