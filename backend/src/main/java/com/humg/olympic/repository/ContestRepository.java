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
    @Query("SELECT c FROM Contest c LEFT JOIN FETCH c.creator " +
            "WHERE (:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%',:search,'%'))) " +
            "AND (:status IS NULL OR c.status = :status) " +
            "AND (:published IS NULL OR c.isPublished = :published) " +
            "ORDER BY c.createdAt DESC")
    List<Contest> findAllAdmin(@Param("search")    String search,
                               @Param("status")    String status,
                               @Param("published") Boolean published);

    long countByStatus(String status);
    long countByIsPublished(Boolean isPublished);
}