package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "news_post")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NewsPost {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private UserHumg author;

    @Column(length = 300, nullable = false)
    private String title;

    /** Tóm tắt ngắn hiển thị ở danh sách */
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /** Ảnh bìa (URL) */
    @Column(name = "cover_url")
    private String coverUrl;

    /** Danh mục: ANNOUNCEMENT, EVENT, ACHIEVEMENT, GENERAL */
    @Column(length = 30)
    @Builder.Default
    private String category = "GENERAL";

    /** Đã xuất bản chưa */
    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    /** Bài nổi bật */
    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}