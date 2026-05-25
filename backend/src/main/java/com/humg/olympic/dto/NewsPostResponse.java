package com.humg.olympic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NewsPostResponse {

    private Long   id;
    private Long   authorId;
    private String authorName;
    private String authorAvatar;

    private String  title;
    private String  summary;
    private String  content;
    private String  coverUrl;
    private String  category;
    private Boolean isPublished;
    private Boolean isFeatured;
    private Integer viewCount;

    /** Alias: frontend dùng published/featured thay vì isPublished/isFeatured */
    @JsonProperty("published")
    public Boolean getPublished() { return isPublished; }

    @JsonProperty("featured")
    public Boolean getFeatured()  { return isFeatured; }

    /** Ngày xuất bản (hiển thị trên trang detail) */
    private LocalDateTime publishedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
