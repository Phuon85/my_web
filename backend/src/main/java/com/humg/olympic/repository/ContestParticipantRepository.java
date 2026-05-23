package com.humg.olympic.repository;

import com.humg.olympic.entity.ContestParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ContestParticipantRepository extends JpaRepository<ContestParticipant, Long> {

    long countByContestId(Long contestId);

    boolean existsByContestIdAndUserId(Long contestId, Long userId);

    Optional<ContestParticipant> findByContestIdAndUserId(Long contestId, Long userId);

    @Query("SELECT cp FROM ContestParticipant cp JOIN FETCH cp.user " +
            "WHERE cp.contest.id = :contestId ORDER BY cp.score DESC NULLS LAST")
    java.util.List<ContestParticipant> findByContestIdOrderByScore(@Param("contestId") Long contestId);
}