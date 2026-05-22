package com.humg.olympic.dto;

import lombok.Data;

@Data
public class AddFileRequest {
    private Long    documentId;
    private Boolean canPreview;
    private Integer orderIndex;
}
