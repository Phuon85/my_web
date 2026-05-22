package com.humg.olympic.repository;

import com.humg.olympic.entity.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContestRepository extends JpaRepository<Contest, Long> {

    List<Contest> findByIsPublishedTrueOrderByStartTimeAsc();

    List<Contest> findBySubjectAndIsPublishedTrueOrderByCreatedAtDesc(String subject);

    @Query("SELECT c FROM Contest c WHERE c.isPublished = true " +
           "AND (:subject IS NULL OR c.subject = :subject) " +
           "AND (:status IS NULL OR c.status = :status)")
    List<Contest> findPublished(@Param("subject") String subject,
                                @Param("status") String status);

    // Đếm người đăng ký (tạm thời trả 0 vì chưa có bảng contest_participant đầy đủ)
    default long countParticipants(Long contestId) {
        return 0L;
    }

    // Kiểm tra đã đăng ký chưa
    default boolean isRegistered(Long contestId, Long userId) {
        return false;
    }
}
