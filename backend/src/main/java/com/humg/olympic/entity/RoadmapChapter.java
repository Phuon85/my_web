package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roadmap_chapter")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapChapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "teacher_note", columnDefinition = "TEXT")
    private String teacherNote;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<RoadmapFile> files = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
