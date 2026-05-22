package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "document")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người upload
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private UserHumg uploader;

    // Thuộc chương nào (nếu null = tài liệu tự do)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private RoadmapChapter chapter;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    // PDF | DOCX | PPTX | MP4 | ZIP
    @Column(name = "file_type", length = 20)
    private String fileType;

    @Column(length = 100)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    // Kích thước file (bytes)
    @Column(name = "file_size")
    private Long fileSize;

    // Số lượt xem và tải
    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "download_count")
    @Builder.Default
    private Integer downloadCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}