package com.humg.olympic.repository;

import com.humg.olympic.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    @Query("SELECT e FROM Exercise e WHERE e.isPublished = true " +
           "AND (:subject IS NULL OR e.subject = :subject) " +
           "AND (:level   IS NULL OR e.level   = :level)   " +
           "AND (:type    IS NULL OR e.type    = :type)    " +
           "ORDER BY e.createdAt DESC")
    List<Exercise> findPublished(@Param("subject") String subject,
                                 @Param("level")   String level,
                                 @Param("type")    String type);

    @Query("SELECT e FROM Exercise e " +
           "WHERE (:subject IS NULL OR e.subject = :subject) " +
           "AND   (:level   IS NULL OR e.level   = :level)   " +
           "AND   (:type    IS NULL OR e.type    = :type)    " +
           "ORDER BY e.createdAt DESC")
    List<Exercise> findAllFiltered(@Param("subject") String subject,
                                   @Param("level")   String level,
                                   @Param("type")    String type);

    long countByIsPublished(Boolean isPublished);
    long countByLevel(String level);
}
