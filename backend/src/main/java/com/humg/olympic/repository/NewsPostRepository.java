package com.humg.olympic.repository;

import com.humg.olympic.entity.NewsPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NewsPostRepository extends JpaRepository<NewsPost, Long> {

    /** Danh sách tin đã xuất bản */
    @Query("""
        SELECT n FROM NewsPost n
        WHERE n.isPublished = true
          AND (:category IS NULL OR n.category = :category)
          AND (:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(n.summary) LIKE LOWER(CONCAT('%',:search,'%')))
        ORDER BY n.isFeatured DESC, n.createdAt DESC
        """)
    Page<NewsPost> findPublished(
            @Param("category") String category,
            @Param("search")   String search,
            Pageable pageable);

    /** Tin nổi bật (tối đa 5) */
    List<NewsPost> findTop5ByIsPublishedTrueAndIsFeaturedTrueOrderByCreatedAtDesc();

    /** Admin — tất cả tin kể cả draft */
    Page<NewsPost> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Modifying
    @Query("UPDATE NewsPost n SET n.viewCount = n.viewCount + 1 WHERE n.id = :id")
    void incrementView(@Param("id") Long id);
}