package com.humg.olympic.repository;

import com.humg.olympic.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findAllByOrderByCreatedAtDesc();

    List<Team> findByIsActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT t FROM Team t WHERE " +
           "LOWER(t.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(t.subject) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Team> search(String q);
}