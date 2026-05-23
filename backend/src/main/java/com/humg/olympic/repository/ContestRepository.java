package com.humg.olympic.repository;

import com.humg.olympic.entity.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ContestRepository extends JpaRepository<Contest, Long> {

    List<Contest> findByIsPublishedTrueOrderByStartTimeAsc();

    @Query("SELECT c FROM Contest c WHERE c.isPublished = true " +
            "AND (:subject IS NULL OR c.subject = :subject) " +
            "AND (:status IS NULL OR c.status = :status) " +
            "ORDER BY c.startTime ASC")
    List<Contest> findPublished(@Param("subject") String subject,
                                @Param("status")  String status);

    // Admin: tìm tất cả kể cả DRAFT
    @Query(value = "SELECT c.id, c.creator_id, c.title, c.description, c.subject, c.status, " +
            "c.start_time, c.end_time, c.duration_minutes, " +
            "c.prize_first, c.prize_second, c.prize_third, " +
            "c.is_published, c.created_at, c.updated_at " +
            "FROM contest c " +
            "WHERE (:search IS NULL OR c.title ILIKE '%' || :search || '%') " +
            "AND (:status IS NULL OR c.status = :status) " +
            "AND (CAST(:published AS boolean) IS NULL OR c.is_published = CAST(:published AS boolean)) " +
            "ORDER BY c.created_at DESC",
            nativeQuery = true)
    List<Contest> findAllAdmin(@Param("search")    String search,
                               @Param("status")    String status,
                               @Param("published") Boolean published);

    long countByStatus(String status);
    long countByIsPublished(Boolean isPublished);
}