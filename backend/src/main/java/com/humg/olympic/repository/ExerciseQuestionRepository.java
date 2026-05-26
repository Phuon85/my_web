package com.humg.olympic.repository;

import com.humg.olympic.entity.ExerciseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExerciseQuestionRepository extends JpaRepository<ExerciseQuestion, Long> {

    List<ExerciseQuestion> findByExerciseIdOrderByOrderIndexAsc(Long exerciseId);

    long countByExerciseId(Long exerciseId);

    @Query("SELECT COALESCE(MAX(q.orderIndex), -1) FROM ExerciseQuestion q WHERE q.exercise.id = :exId")
    int findMaxOrderIndex(@Param("exId") Long exerciseId);

    @Modifying
    @Query("DELETE FROM ExerciseQuestion q WHERE q.exercise.id = :exId")
    void deleteAllByExerciseId(@Param("exId") Long exerciseId);
}
