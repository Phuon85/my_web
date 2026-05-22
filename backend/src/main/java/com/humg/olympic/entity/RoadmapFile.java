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

    // Liên kết tới Document đã upload
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    // Thứ tự hiển thị trong chương
    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    // Có cho xem trước (PDF preview, video) không
    @Column(name = "can_preview", nullable = false)
    @Builder.Default
    private Boolean canPreview = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
