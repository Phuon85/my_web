package com.humg.olympic.service;

import com.humg.olympic.dto.*;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Leaderboard ─────────────────────────────────────────────────────────
    public List<UserInfoResponse> getLeaderboard(int limit) {
        return userRepository.findLeaderboard(PageRequest.of(0, limit))
                .stream()
                .map(this::toInfo)
                .collect(Collectors.toList());
    }

    // ── Cập nhật thông tin bản thân ─────────────────────────────────────────
    @Transactional
    public UserInfoResponse updateMe(UpdateProfileRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (req.getFullName() != null && !req.getFullName().isBlank())
            user.setFullName(req.getFullName());
        if (req.getLop()       != null) user.setLop(req.getLop());
        if (req.getKhoa()      != null) user.setKhoa(req.getKhoa());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());

        return toInfo(userRepository.save(user));
    }

    // ── Admin: Lấy danh sách người dùng ────────────────────────────────────
    public List<UserInfoResponse> getAll(String search, String role, Boolean isActive) {
        String s = (search != null && search.isBlank()) ? null : search;
        String r = (role   != null && role.isBlank())   ? null : role;
        return userRepository.searchUsers(s, r, isActive)
                .stream()
                .map(this::toInfo)
                .collect(Collectors.toList());
    }

    // ── Admin: Xem chi tiết 1 người dùng ───────────────────────────────────
    public UserInfoResponse getById(Long id) {
        return toInfo(findOrThrow(id));
    }

    // ── Admin: Tạo người dùng mới ───────────────────────────────────────────
    @Transactional
    public UserInfoResponse createUser(AdminCreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email '" + req.getEmail() + "' đã được sử dụng.");

        if (req.getMssv() != null && !req.getMssv().isBlank()
                && userRepository.existsByMssv(req.getMssv()))
            throw new IllegalArgumentException("MSSV '" + req.getMssv() + "' đã tồn tại.");

        UserHumg user = UserHumg.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .mssv(req.getMssv())
                .lop(req.getLop())
                .khoa(req.getKhoa())
                .truong(req.getTruong())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole() != null ? req.getRole() : "STUDENT")
                .isInternal(req.getIsInternal() != null ? req.getIsInternal() : true)
                .isActive(true)
                .build();

        return toInfo(userRepository.save(user));
    }

    // ── Admin: Cập nhật thông tin người dùng ────────────────────────────────
    @Transactional
    public UserInfoResponse updateUser(Long id, AdminUpdateUserRequest req) {
        UserHumg user = findOrThrow(id);

        if (req.getFullName() != null && !req.getFullName().isBlank())
            user.setFullName(req.getFullName());

        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail()))
                throw new IllegalArgumentException("Email '" + req.getEmail() + "' đã được sử dụng.");
            user.setEmail(req.getEmail());
        }

        if (req.getMssv() != null) {
            if (!req.getMssv().equals(user.getMssv())
                    && userRepository.existsByMssv(req.getMssv()))
                throw new IllegalArgumentException("MSSV '" + req.getMssv() + "' đã tồn tại.");
            user.setMssv(req.getMssv());
        }

        if (req.getLop()       != null) user.setLop(req.getLop());
        if (req.getKhoa()      != null) user.setKhoa(req.getKhoa());
        if (req.getTruong()    != null) user.setTruong(req.getTruong());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());

        if (req.getRole() != null) {
            List<String> valid = List.of("STUDENT", "TEACHER", "MANAGER", "ADMIN");
            if (!valid.contains(req.getRole()))
                throw new IllegalArgumentException("Vai trò không hợp lệ: " + req.getRole());
            user.setRole(req.getRole());
        }

        return toInfo(userRepository.save(user));
    }

    // ── Admin: Reset mật khẩu về 123456 ─────────────────────────────────────
    @Transactional
    public void resetPassword(Long id) {
        UserHumg user = findOrThrow(id);
        user.setPassword(passwordEncoder.encode("123456"));
        userRepository.save(user);
    }

    // ── Admin: Khóa / Mở khóa tài khoản ────────────────────────────────────
    @Transactional
    public boolean toggleActive(Long id) {
        UserHumg user = findOrThrow(id);
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        return user.getIsActive();
    }

    // ── Admin: Đổi vai trò ───────────────────────────────────────────────────
    @Transactional
    public void changeRole(Long id, String role) {
        List<String> valid = List.of("STUDENT", "TEACHER", "MANAGER", "ADMIN");
        if (!valid.contains(role))
            throw new IllegalArgumentException("Vai trò không hợp lệ: " + role);
        UserHumg user = findOrThrow(id);
        user.setRole(role);
        userRepository.save(user);
    }

    // ── Admin: Xóa người dùng ────────────────────────────────────────────────
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id))
            throw new EntityNotFoundException("Không tìm thấy người dùng id=" + id);
        userRepository.deleteById(id);
    }

    // ── Admin: Thống kê ──────────────────────────────────────────────────────
    public UserStatsResponse getStats() {
        return UserStatsResponse.builder()
                .total(   userRepository.count())
                .active(  userRepository.countByIsActive(true))
                .locked(  userRepository.countByIsActive(false))
                .admin(   userRepository.countByRole("ADMIN"))
                .teacher( userRepository.countByRole("TEACHER"))
                .student( userRepository.countByRole("STUDENT"))
                .internal(userRepository.countByIsInternal(true))
                .external(userRepository.countByIsInternal(false))
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    private UserHumg findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy người dùng id=" + id));
    }

    public UserInfoResponse toInfo(UserHumg u) {
        return UserInfoResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .mssv(u.getMssv())
                .role(u.getRole())
                .avatarUrl(u.getAvatarUrl())
                .lop(u.getLop())
                .khoa(u.getKhoa())
                .truong(u.getTruong())
                .totalScore(u.getTotalScore())
                .rank(u.getRank())
                .isInternal(u.getIsInternal())
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}