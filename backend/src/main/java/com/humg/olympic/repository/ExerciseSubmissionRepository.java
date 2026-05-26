package com.humg.olympic.repository;

import com.humg.olympic.entity.ExerciseSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ExerciseSubmissionRepository extends JpaRepository<ExerciseSubmission, Long> {

    /** Lấy lần nộp gần nhất của user cho một bài tập */
    Optional<ExerciseSubmission> findTopByExerciseIdAndUserIdOrderBySubmittedAtDesc(
            Long exerciseId, Long userId);

    /** Tất cả lần nộp của 1 bài (teacher xem) */
    List<ExerciseSubmission> findByExerciseIdOrderByScoreDescSubmittedAtAsc(Long exerciseId);

    /** Đếm số lần nộp */
    long countByExerciseId(Long exerciseId);

    /** Điểm trung bình của bài */
    @Query("SELECT AVG(s.score) FROM ExerciseSubmission s WHERE s.exercise.id = :exId")
    Double avgScoreByExerciseId(@Param("exId") Long exerciseId);

    boolean existsByExerciseIdAndUserId(Long exerciseId, Long userId);
}
