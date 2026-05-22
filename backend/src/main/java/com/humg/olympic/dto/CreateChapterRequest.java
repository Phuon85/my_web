package com.humg.olympic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateChapterRequest {
    @NotBlank(message = "Vui lòng nhập tiêu đề chương")
    private String  title;
    private String  teacherNote;
    private Integer orderIndex;
}
