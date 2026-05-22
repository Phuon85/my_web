package com.humg.olympic.repository;

import com.humg.olympic.entity.RoadmapFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoadmapFileRepository extends JpaRepository<RoadmapFile, Long> {

    List<RoadmapFile> findByChapterIdOrderByOrderIndexAsc(Long chapterId);
}
