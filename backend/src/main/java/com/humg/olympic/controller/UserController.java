package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── Public / User endpoints ──────────────────────────────────────────────

    /** Bảng xếp hạng — public */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserInfoResponse>> leaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(userService.getLeaderboard(limit));
    }

    /** Cập nhật thông tin bản thân */
    @PutMapping("/me")
    public ResponseEntity<UserInfoResponse> updateMe(
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateMe(req));
    }

    // ── Admin endpoints ──────────────────────────────────────────────────────

    /**
     * Lấy danh sách người dùng (có tìm kiếm + lọc)
     * GET /api/users?search=...&role=STUDENT&isActive=true
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<UserInfoResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(userService.getAll(search, role, isActive));
    }

    /**
     * Thống kê người dùng
     * GET /api/users/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<UserStatsResponse> getStats() {
        return ResponseEntity.ok(userService.getStats());
    }

    /**
     * Xem chi tiết 1 người dùng
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<UserInfoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    /**
     * Admin tạo người dùng mới
     * POST /api/users
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserInfoResponse> createUser(
            @Valid @RequestBody AdminCreateUserRequest req) {
        UserInfoResponse created = userService.createUser(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Admin cập nhật thông tin người dùng
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserInfoResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest req) {
        return ResponseEntity.ok(userService.updateUser(id, req));
    }

    /**
     * Khóa / Mở khóa tài khoản
     * PATCH /api/users/{id}/toggle-active
     */
    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<MessageResponse> toggleActive(@PathVariable Long id) {
        boolean nowActive = userService.toggleActive(id);
        return ResponseEntity.ok(new MessageResponse(
                nowActive ? "Đã mở tài khoản!" : "Đã khóa tài khoản!"));
    }

    /**
     * Đổi vai trò người dùng
     * PATCH /api/users/{id}/role?role=TEACHER
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> changeRole(
            @PathVariable Long id,
            @RequestParam String role) {
        userService.changeRole(id, role);
        return ResponseEntity.ok(new MessageResponse("Đã cập nhật vai trò: " + role));
    }

    /**
     * Xóa người dùng
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa người dùng thành công."));
    }
}