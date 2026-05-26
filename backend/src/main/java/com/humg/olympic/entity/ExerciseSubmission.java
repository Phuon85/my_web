package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "exercise_submission")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExerciseSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserHumg user;

    /**
     * JSON map: { "questionId": "userAnswer", ... }
     * MULTIPLE: "A,C"
     * ESSAY:    bài viết
     */
    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson;

    @Column(name = "score")
    private Double score;

    @Column(name = "total_score")
    private Double totalScore;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "total_question")
    private Integer totalQuestion;

    /** Giây thực tế làm bài */
    @Column(name = "time_spent")
    private Integer timeSpent;

    /** Số lần chuyển tab bị phát hiện */
    @Column(name = "tab_switch_count")
    @Builder.Default
    private Integer tabSwitchCount = 0;

    /**
     * PENDING  — chờ chấm (có câu tự luận)
     * GRADED   — đã chấm xong
     * AUTO     — chỉ trắc nghiệm, chấm tự động
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "AUTO";

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
}
