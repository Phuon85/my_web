package com.humg.olympic.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "exercise_question")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExerciseQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    /**
     * SINGLE       — trắc nghiệm 1 đáp án
     * MULTIPLE     — trắc nghiệm nhiều đáp án
     * SHORT_ANSWER — điền đáp án ngắn
     * ESSAY        — tự luận (chấm tay)
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String type = "SINGLE";

    /** EASY / MEDIUM / HARD / EXPERT — mức độ riêng của từng câu */
    @Column(length = 20)
    @Builder.Default
    private String level = "MEDIUM";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /** URL hình ảnh minh hoạ (tùy chọn) */
    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    /**
     * Các đáp án cho SINGLE / MULTIPLE — lưu dạng JSON array string
     * VD: ["Hà Nội","TP.HCM","Đà Nẵng","Cần Thơ"]
     */
    @Column(name = "choices_json", columnDefinition = "TEXT")
    private String choicesJson;

    /**
     * Đáp án đúng:
     * - SINGLE:       "A"
     * - MULTIPLE:     "A,C"  (comma separated)
     * - SHORT_ANSWER: "3.14"
     * - ESSAY:        null (chấm tay)
     */
    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    /** Điểm của câu này */
    @Column(nullable = false)
    @Builder.Default
    private Double score = 1.0;

    /** Gợi ý hiển thị sau khi nộp */
    @Column(columnDefinition = "TEXT")
    private String hint;

    /** Thứ tự trong bài */
    @Column(name = "order_index")
    @Builder.Default
    private Integer orderIndex = 0;
}
