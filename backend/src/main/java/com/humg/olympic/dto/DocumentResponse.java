package com.humg.olympic.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DocumentResponse {
    private Long    id;
    private String  title;
    private String  subject;
    private String  fileUrl;
    private String  fileType;
    private String  originalFilename;
    private String  description;
    private Boolean isPublic;
    private Long    fileSize;
    private String  fileSizeFormatted;
    private Integer downloadCount;
    private Integer viewCount;
    private String  uploaderName;
    private Long    uploaderId;
    private LocalDateTime createdAt;
    private String  createdAtFormatted;
}
