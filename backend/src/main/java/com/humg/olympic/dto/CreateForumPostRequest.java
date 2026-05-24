package com.humg.olympic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateForumPostRequest {

    // Truyền ID của bài viết gốc nếu đây là bình luận.
    // Nếu tạo bài viết mới tinh thì để null.
    private Long parentId;

    // Tiêu đề: Bắt buộc với bài gốc, nhưng bình luận thì có thể không cần
    private String title;

    @NotBlank(message = "Nội dung bài viết không được để trống")
    private String content;

    // Môn học (Toán, Lý, Hóa, CNTT, Ngoại ngữ, Chung)
    // Backend sẽ tự set mặc định là "Chung" nếu người dùng không chọn
    private String subject;

    // Tag tự do: VD: "Đại số", "Giải tích"...
    private String tags;
}