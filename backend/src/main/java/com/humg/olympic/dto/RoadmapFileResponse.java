package com.humg.olympic.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoadmapFileResponse {
    private Long    id;
    private Long    documentId;
    private String  name;
    private String  fileType;
    private String  size;
    private String  fileUrl;
    private Boolean canPreview;
    private Integer orderIndex;
    private LocalDateTime updatedAt;
    private String  updatedAtFormatted;
}
