package com.humg.olympic.repository;

import com.humg.olympic.entity.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query(value = "SELECT l.* FROM activity_log l LEFT JOIN user_humg u ON l.user_id = u.id " +
            "WHERE (:action IS NULL OR l.action = :action) " +
            "AND (:search IS NULL OR u.full_name ILIKE '%' || :search || '%' " +
            "  OR u.email ILIKE '%' || :search || '%') " +
            "ORDER BY l.created_at DESC " +
            "LIMIT :#{#pageable.pageSize} OFFSET :#{#pageable.offset}",
            nativeQuery = true)
    List<ActivityLog> findLogs(@Param("action") String action,
                               @Param("search") String search,
                               Pageable pageable);

    long count();
}