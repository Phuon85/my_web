package com.humg.olympic.repository;

import com.humg.olympic.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByIsPublicTrueOrderByCreatedAtDesc();

    List<Document> findBySubjectAndIsPublicTrueOrderByCreatedAtDesc(String subject);

    @Query("SELECT d FROM Document d WHERE d.isPublic = true AND (" +
           "LOWER(d.title) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(d.description) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(d.uploader.fullName) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Document> search(@Param("q") String query);

    List<Document> findByUploaderIdOrderByCreatedAtDesc(Long uploaderId);

    @Query("SELECT d FROM Document d WHERE d.isPublic = true " +
           "AND (:subject IS NULL OR d.subject = :subject) " +
           "AND (:q IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Document> findFiltered(@Param("subject") String subject, @Param("q") String q);

    @Modifying @Transactional
    @Query("UPDATE Document d SET d.downloadCount = d.downloadCount + 1 WHERE d.id = :id")
    void incrementDownload(@Param("id") Long id);

    @Modifying @Transactional
    @Query("UPDATE Document d SET d.viewCount = d.viewCount + 1 WHERE d.id = :id")
    void incrementView(@Param("id") Long id);
}
