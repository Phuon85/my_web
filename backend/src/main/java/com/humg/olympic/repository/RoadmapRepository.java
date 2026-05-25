package com.humg.olympic.repository;

import com.humg.olympic.entity.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {

    List<Roadmap> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Roadmap> findBySubjectAndIsActiveTrueOrderByCreatedAtDesc(String subject);

    // Dành cho tất cả học sinh (Chỉ lấy PUBLIC)
    List<Roadmap> findByIsActiveTrueAndVisibilityOrderByCreatedAtDesc(Roadmap.Visibility visibility);

    // Dành cho thành viên Đội tuyển (Lấy PUBLIC + PRIVATE của team đó)
    @Query("""
        SELECT r FROM Roadmap r 
        WHERE r.isActive = true 
          AND (r.visibility = 'PUBLIC' OR (r.visibility = 'PRIVATE' AND r.teamId IN :teamIds))
        ORDER BY r.createdAt DESC
    """)
    List<Roadmap> findAccessibleRoadmaps(@Param("teamIds") List<Long> teamIds);
}