package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class AdminController {

    private final AdminService adminService;

    /** GET /api/admin/dashboard */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    /** GET /api/admin/logs?action=LOGIN&search=nguyen&page=0&size=20 */
    @GetMapping("/logs")
    public ResponseEntity<List<ActivityLogResponse>> logs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getLogs(action, search, page, size));
    }
}