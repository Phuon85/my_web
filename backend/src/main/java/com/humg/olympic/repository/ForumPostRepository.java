package com.humg.olympic.repository;

import com.humg.olympic.entity.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    /** Lấy tất cả bài gốc (parent = null), không ẩn, sắp xếp: ghim trước, mới nhất sau */
    @Query("""
        SELECT p FROM ForumPost p
        WHERE p.parent IS NULL
          AND p.isHidden = false
          AND (:subject IS NULL OR p.subject = :subject)
          AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(p.content) LIKE LOWER(CONCAT('%',:search,'%')))
        ORDER BY p.isPinned DESC, p.createdAt DESC
        """)
    Page<ForumPost> findThreads(
            @Param("subject") String subject,
            @Param("search")  String search,
            Pageable pageable);

    /** Lấy tất cả bình luận trực tiếp của một bài gốc */
    @Query("""
        SELECT p FROM ForumPost p
        WHERE p.parent.id = :parentId
          AND p.isHidden = false
        ORDER BY p.createdAt ASC
        """)
    List<ForumPost> findComments(@Param("parentId") Long parentId);

    /** Đếm số bình luận của mỗi bài gốc */
    @Query("SELECT COUNT(p) FROM ForumPost p WHERE p.parent.id = :parentId AND p.isHidden = false")
    long countComments(@Param("parentId") Long parentId);

    /** Tăng view */
    @Modifying
    @Query("UPDATE ForumPost p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementView(@Param("id") Long id);
}