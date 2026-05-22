package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roadmap")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên lộ trình: "Lộ trình Chinh phục Olympic Đại số"
    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Môn học: Toán học | Vật lý | ...
    @Column(length = 100)
    private String subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private UserHumg creator;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // Các chương con (cascade: xóa roadmap → xóa luôn chapters)
    @OneToMany(mappedBy = "roadmap", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<RoadmapChapter> chapters = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
