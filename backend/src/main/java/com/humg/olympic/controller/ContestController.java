package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.ContestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    // ── Public / User ────────────────────────────────────────────────────────

    /** GET /api/contests — danh sách đã công bố */
    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAll(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(contestService.getAll(subject, status));
    }

    /** GET /api/contests/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getById(id));
    }

    /** GET /api/contests/{id}/participants */
    @GetMapping("/{id}/participants")
    public ResponseEntity<List<ContestParticipantResponse>> getParticipants(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getParticipants(id));
    }

    /** POST /api/contests/{id}/register */
    @PostMapping("/{id}/register")
    public ResponseEntity<MessageResponse> register(@PathVariable Long id) {
        contestService.register(id);
        return ResponseEntity.ok(new MessageResponse("Đăng ký tham dự thành công!"));
    }

    // ── Teacher / Manager / Admin ────────────────────────────────────────────

    /** POST /api/contests */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<ContestResponse> create(@Valid @RequestBody CreateContestRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contestService.create(req));
    }

    /** PUT /api/contests/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<ContestResponse> update(
            @PathVariable Long id, @RequestBody CreateContestRequest req) {
        return ResponseEntity.ok(contestService.update(id, req));
    }

    /** PATCH /api/contests/{id}/publish */
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<MessageResponse> publish(@PathVariable Long id) {
        contestService.publish(id);
        return ResponseEntity.ok(new MessageResponse("Đã công bố cuộc thi!"));
    }

    /** PATCH /api/contests/{id}/restore */
    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<ContestResponse> restore(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.restore(id));
    }

    // ── Admin only ────────────────────────────────────────────────────────────

    /** GET /api/contests/admin — toàn bộ kể cả DRAFT */
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<ContestResponse>> adminGetAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean published) {
        return ResponseEntity.ok(contestService.getAll(search, status, published));
    }

    /** DELETE /api/contests/{id} — xóa mềm (đặt status=DELETED) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContestResponse> delete(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.softDelete(id));
    }
}