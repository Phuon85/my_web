package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.ContestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAll(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(contestService.getAll(subject, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contestService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<ContestResponse> create(@Valid @RequestBody CreateContestRequest req) {
        return ResponseEntity.ok(contestService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<ContestResponse> update(
            @PathVariable Long id, @RequestBody CreateContestRequest req) {
        return ResponseEntity.ok(contestService.update(id, req));
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<MessageResponse> publish(@PathVariable Long id) {
        contestService.publish(id);
        return ResponseEntity.ok(new MessageResponse("Đã công bố cuộc thi!"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        contestService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa cuộc thi!"));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<MessageResponse> register(@PathVariable Long id) {
        contestService.register(id);
        return ResponseEntity.ok(new MessageResponse("Đăng ký tham dự thành công!"));
    }
}
