package com.humg.olympic.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder // Đã bổ sung @Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateNewsRequest {

    @NotBlank
    @Size(max = 300)
    private String title;

    private String summary;

    @NotBlank
    private String content;

    private String coverUrl;

    @Builder.Default
    private String category = "GENERAL";

    @Builder.Default
    private Boolean isPublished = false;

    @Builder.Default
    private Boolean isFeatured = false;
}