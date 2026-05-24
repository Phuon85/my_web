package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "forum_post")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ForumPost {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Null = bài gốc, non-null = bình luận */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private ForumPost parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private UserHumg author;

    /** Tiêu đề — chỉ bài gốc mới có */
    @Column(length = 300)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /** Môn học: Toán, Lý, Hóa, CNTT, Ngoại ngữ, Chung */
    @Column(length = 50)
    @Builder.Default
    private String subject = "Chung";

    /** Tag tự do: "Đại số", "Giải tích", ... */
    @Column(length = 200)
    private String tags;

    /** Teacher/Admin có thể ghim bài gốc */
    @Column(name = "is_pinned")
    @Builder.Default
    private Boolean isPinned = false;

    /** Ẩn bài vi phạm */
    @Column(name = "is_hidden")
    @Builder.Default
    private Boolean isHidden = false;

    /** Số lượt xem (chỉ đếm bài gốc) */
    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    /** Số lượt thích */
    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}