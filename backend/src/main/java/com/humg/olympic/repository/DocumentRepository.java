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

    @Query(value = "SELECT d.* FROM document d JOIN user_humg u ON d.uploader_id = u.id " +
            "WHERE d.is_public = true AND (" +
            "d.title ILIKE '%' || :q || '%' OR " +
            "d.description ILIKE '%' || :q || '%' OR " +
            "u.full_name ILIKE '%' || :q || '%')",
            nativeQuery = true)
    List<Document> search(@Param("q") String query);

    List<Document> findByUploaderIdOrderByCreatedAtDesc(Long uploaderId);

    @Query(value = "SELECT * FROM document d WHERE d.is_public = true " +
            "AND (:subject IS NULL OR d.subject = :subject) " +
            "AND (:q IS NULL OR d.title ILIKE '%' || :q || '%')",
            nativeQuery = true)
    List<Document> findFiltered(@Param("subject") String subject, @Param("q") String q);

    @Modifying @Transactional
    @Query("UPDATE Document d SET d.downloadCount = d.downloadCount + 1 WHERE d.id = :id")
    void incrementDownload(@Param("id") Long id);

    @Modifying @Transactional
    @Query("UPDATE Document d SET d.viewCount = d.viewCount + 1 WHERE d.id = :id")
    void incrementView(@Param("id") Long id);
}