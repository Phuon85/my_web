package com.humg.olympic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddFileRequest {

    // Phân loại: "DOCUMENT" hoặc "VIDEO_LINK"
    private String itemType;

    // Dùng khi chọn tài liệu từ hệ thống
    private Long documentId;

    // Dùng khi nhúng link Video (Youtube, Drive...)
    private String externalUrl;

    // Tiêu đề của bài giảng/video
    private String title;

    // Cho phép xem trước hay không
    private Boolean canPreview;

    // Thứ tự sắp xếp trong chương
    private Integer orderIndex;
}