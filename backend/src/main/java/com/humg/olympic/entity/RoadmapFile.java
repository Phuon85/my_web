package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "roadmap_file")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private RoadmapChapter chapter;

    // Phân loại item (Tài liệu hoặc Video)
    public enum ItemType { DOCUMENT, VIDEO_LINK }

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    @Builder.Default
    private ItemType itemType = ItemType.DOCUMENT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(name = "external_url", length = 500)
    private String externalUrl;
    
    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    @Column(name = "can_preview", nullable = false)
    @Builder.Default
    private Boolean canPreview = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}