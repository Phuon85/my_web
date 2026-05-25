package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    // ── Public ───────────────────────────────────────────────────────────────

    /** GET /api/teams — danh sách đội tuyển đang hoạt động */
    @GetMapping
    public ResponseEntity<List<TeamResponse>> getActive() {
        return ResponseEntity.ok(teamService.getActiveTeams());
    }

    /** GET /api/teams/{id} — chi tiết đội tuyển + thành viên */
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamDetail(id));
    }

    // ── Admin / Manager ──────────────────────────────────────────────────────

    /** GET /api/teams/admin/all */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<TeamResponse>> adminGetAll(
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(teamService.getAllTeams(q));
    }

    /** POST /api/teams */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TEACHER')")
    public ResponseEntity<TeamResponse> create(@RequestBody CreateTeamRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(req));
    }

    /** PUT /api/teams/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TEACHER')")
    public ResponseEntity<TeamResponse> update(@PathVariable Long id,
                                               @RequestBody UpdateTeamRequest req) {
        return ResponseEntity.ok(teamService.updateTeam(id, req));
    }

    /** PATCH /api/teams/{id}/toggle-active */
    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<TeamResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.toggleActive(id));
    }

    /** DELETE /api/teams/{id} */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa đội tuyển."));
    }

    // ── Thành viên ───────────────────────────────────────────────────────────

    /** POST /api/teams/{id}/members */
    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TEACHER')")
    public ResponseEntity<TeamMemberResponse> addMember(@PathVariable Long id,
                                                        @RequestBody AddTeamMemberRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.addMember(id, req));
    }

    /** DELETE /api/teams/{teamId}/members/{userId} */
    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TEACHER')")
    public ResponseEntity<MessageResponse> removeMember(@PathVariable Long teamId,
                                                        @PathVariable Long userId) {
        teamService.removeMember(teamId, userId);
        return ResponseEntity.ok(new MessageResponse("Đã xóa thành viên."));
    }

    /** PATCH /api/teams/{teamId}/members/{userId}/role */
    @PatchMapping("/{teamId}/members/{userId}/role")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TEACHER')")
    public ResponseEntity<TeamMemberResponse> updateMemberRole(
            @PathVariable Long teamId,
            @PathVariable Long userId,
            @RequestParam String role) {
        return ResponseEntity.ok(teamService.updateMemberRole(teamId, userId, role));
    }
}