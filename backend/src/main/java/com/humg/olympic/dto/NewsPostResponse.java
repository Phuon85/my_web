package com.humg.olympic.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NewsPostResponse {
    private Long   id;
    private Long   authorId;
    private String authorName;
    private String authorAvatar;

    private String title;
    private String summary;
    private String content;
    private String coverUrl;
    private String category;
    private Boolean isPublished;
    private Boolean isFeatured;
    private Integer viewCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}