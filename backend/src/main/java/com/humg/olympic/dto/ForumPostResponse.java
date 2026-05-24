package com.humg.olympic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForumPostResponse {

    private Long id;
    private Long parentId;

    // Thông tin tác giả
    private Long authorId;
    private String authorName;
    private String authorAvatar;
    private String authorRole;

    // Nội dung bài viết
    private String title;
    private String content;
    private String subject;
    private String tags;

    // Trạng thái hiển thị
    private Boolean isPinned;
    private Boolean isHidden;

    // Thống kê tương tác
    private Integer viewCount;
    private Integer likeCount;
    private Long commentCount;
    private Boolean likedByMe;

    // Thời gian
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}