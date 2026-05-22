package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserInfoResponse>> leaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(userService.getLeaderboard(limit));
    }

    @PutMapping("/me")
    public ResponseEntity<UserInfoResponse> updateMe(
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateMe(req));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserInfoResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.getAll(search, role));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> toggleActive(@PathVariable Long id) {
        boolean nowActive = userService.toggleActive(id);
        return ResponseEntity.ok(new MessageResponse(
                nowActive ? "Đã mở tài khoản!" : "Đã khóa tài khoản!"));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> changeRole(
            @PathVariable Long id, @RequestParam String role) {
        userService.changeRole(id, role);
        return ResponseEntity.ok(new MessageResponse("Đã cập nhật vai trò: " + role));
    }
}
