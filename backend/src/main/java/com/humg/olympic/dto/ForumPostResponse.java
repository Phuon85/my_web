package com.humg.olympic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ForumPostResponse {

    private Long   id;
    private Long   parentId;

    private Long   authorId;
    private String authorName;
    private String authorAvatar;
    private String authorRole;

    private String title;
    private String content;

    /** category key: math, physics, chem, english, it, general */
    private String category;

    /** Tags dạng List<String> */
    private List<String> tags;

    private Boolean isPinned;
    private Boolean isHidden;

    /** Alias: frontend dùng pinned/hidden thay vì isPinned/isHidden */
    @JsonProperty("pinned")
    public Boolean getPinned() { return isPinned; }

    @JsonProperty("hidden")
    public Boolean getHidden() { return isHidden; }

    private Integer viewCount;
    private Integer likeCount;
    private Long    commentCount;
    private Boolean likedByMe;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
