package com.humg.olympic.repository;

import com.humg.olympic.entity.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {

    List<Roadmap> findByIsActiveTrueOrderByCreatedAtDesc();

    List<Roadmap> findBySubjectAndIsActiveTrueOrderByCreatedAtDesc(String subject);
}
