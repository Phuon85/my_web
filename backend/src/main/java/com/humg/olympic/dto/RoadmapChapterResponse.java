package com.humg.olympic.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoadmapChapterResponse {
    private Long    id;
    private String  title;
    private String  teacherNote;
    private Integer orderIndex;
    private Integer fileCount;
    private List<RoadmapFileResponse> files;
    private LocalDateTime updatedAt;
}
