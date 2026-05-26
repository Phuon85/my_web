package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exercise")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private UserHumg creator;

    @Column(nullable = false, length = 250)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** math / physics / chem / english / it */
    @Column(length = 50)
    private String subject;

    /** EASY / MEDIUM / HARD / EXPERT */
    @Column(length = 20)
    @Builder.Default
    private String level = "MEDIUM";

    /** QUIZ / ESSAY / MIXED */
    @Column(length = 20)
    @Builder.Default
    private String type = "QUIZ";

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "allow_retake", nullable = false)
    @Builder.Default
    private Boolean allowRetake = true;

    @OneToMany(mappedBy = "exercise",
               cascade = CascadeType.ALL,
               orphanRemoval = true,
               fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<ExerciseQuestion> questions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
