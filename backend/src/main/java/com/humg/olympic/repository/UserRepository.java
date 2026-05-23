package com.humg.olympic.repository;

import com.humg.olympic.entity.UserHumg;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserHumg, Long> {

    Optional<UserHumg> findByEmail(String email);

    Optional<UserHumg> findByMssv(String mssv);

    boolean existsByEmail(String email);

    boolean existsByMssv(String mssv);

    // Tìm theo email HOẶC mssv (dùng cho login)
    @Query("SELECT u FROM UserHumg u WHERE u.email = :c OR u.mssv = :c")
    Optional<UserHumg> findByEmailOrMssv(@Param("c") String credential);

    // Tìm kiếm và lọc có thêm isActive
    @Query(value = "SELECT * FROM user_humg u WHERE " +
            "(:search IS NULL OR u.full_name ILIKE CONCAT('%', :search, '%') " +
            "OR u.email ILIKE CONCAT('%', :search, '%') " +
            "OR u.mssv ILIKE CONCAT('%', :search, '%')) " +
            "AND (:role IS NULL OR u.role = :role) " +
            "AND (CAST(:isActive AS boolean) IS NULL OR u.is_active = CAST(:isActive AS boolean)) " +
            "ORDER BY u.created_at DESC",
            nativeQuery = true)
    List<UserHumg> searchUsers(@Param("search") String search,
                               @Param("role") String role,
                               @Param("isActive") Boolean isActive);
    // Bảng xếp hạng
    @Query("SELECT u FROM UserHumg u WHERE u.role = 'STUDENT' ORDER BY u.totalScore DESC")
    List<UserHumg> findLeaderboard(Pageable pageable);

    // Thống kê
    long countByRole(String role);
    long countByIsActive(Boolean isActive);
    long countByIsInternal(Boolean isInternal);
}