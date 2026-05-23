package com.humg.olympic.repository;

import com.humg.olympic.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("SELECT l FROM ActivityLog l LEFT JOIN FETCH l.user " +
           "WHERE (:action IS NULL OR l.action = :action) " +
           "AND (:search IS NULL OR LOWER(l.user.fullName) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "  OR LOWER(l.user.email) LIKE LOWER(CONCAT('%',:search,'%'))) " +
           "ORDER BY l.createdAt DESC")
    List<ActivityLog> findLogs(@Param("action") String action,
                               @Param("search") String search,
                               Pageable pageable);

    long count();
}