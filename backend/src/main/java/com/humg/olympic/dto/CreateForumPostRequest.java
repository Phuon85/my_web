package com.humg.olympic.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateForumPostRequest {

    /** null = bài gốc, non-null = bình luận hoặc reply */
    private Long parentId;

    /** Tiêu đề — bắt buộc với bài gốc */
    @Size(max = 300)
    private String title;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    private String content;

    /** Category key: math, physics, chem, english, it, general */
    private String category;

    /** subject label (tương thích ngược) */
    private String subject;

    /** Tags dạng List từ frontend */
    private List<String> tags;
}
