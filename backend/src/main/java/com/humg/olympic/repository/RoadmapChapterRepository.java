package com.humg.olympic.repository;

import com.humg.olympic.entity.RoadmapChapter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoadmapChapterRepository extends JpaRepository<RoadmapChapter, Long> {

    List<RoadmapChapter> findByRoadmapIdOrderByOrderIndexAsc(Long roadmapId);
}
