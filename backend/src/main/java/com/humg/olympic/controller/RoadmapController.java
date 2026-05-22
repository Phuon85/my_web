package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.RoadmapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    /**
     * GET /api/roadmaps
     * Danh sách lộ trình (công khai)
     * Query: subject
     */
    @GetMapping
    public ResponseEntity<List<RoadmapResponse>> getAll(
            @RequestParam(required = false) String subject) {
        return ResponseEntity.ok(roadmapService.getAll(subject));
    }

    /**
     * GET /api/roadmaps/{id}
     * Chi tiết lộ trình kèm toàn bộ chương + file
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoadmapResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(roadmapService.getById(id));
    }

    /**
     * POST /api/roadmaps
     * Tạo lộ trình mới — TEACHER+
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<RoadmapResponse> create(
            @Valid @RequestBody CreateRoadmapRequest req) {
        return ResponseEntity.ok(roadmapService.create(req));
    }

    /**
     * PUT /api/roadmaps/{id}
     * Cập nhật thông tin lộ trình — TEACHER+
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<RoadmapResponse> update(
            @PathVariable Long id,
            @RequestBody CreateRoadmapRequest req) {
        return ResponseEntity.ok(roadmapService.update(id, req));
    }

    /**
     * DELETE /api/roadmaps/{id}
     * Xóa lộ trình — ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        roadmapService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa lộ trình!"));
    }

    // ── Chapter endpoints ─────────────────────────────────────────────────────

    /**
     * POST /api/roadmaps/{id}/chapters
     * Thêm chương vào lộ trình
     */
    @PostMapping("/{id}/chapters")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<RoadmapChapterResponse> addChapter(
            @PathVariable Long id,
            @Valid @RequestBody CreateChapterRequest req) {
        return ResponseEntity.ok(roadmapService.addChapter(id, req));
    }

    /**
     * PUT /api/roadmaps/chapters/{chapterId}
     * Cập nhật chương (tiêu đề, lưu ý giảng viên)
     */
    @PutMapping("/chapters/{chapterId}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<RoadmapChapterResponse> updateChapter(
            @PathVariable Long chapterId,
            @RequestBody CreateChapterRequest req) {
        return ResponseEntity.ok(roadmapService.updateChapter(chapterId, req));
    }

    /**
     * DELETE /api/roadmaps/chapters/{chapterId}
     * Xóa chương (xóa luôn các file trong chương)
     */
    @DeleteMapping("/chapters/{chapterId}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<MessageResponse> deleteChapter(@PathVariable Long chapterId) {
        roadmapService.deleteChapter(chapterId);
        return ResponseEntity.ok(new MessageResponse("Đã xóa chương!"));
    }

    // ── File endpoints ────────────────────────────────────────────────────────

    /**
     * POST /api/roadmaps/chapters/{chapterId}/files
     * Thêm tài liệu (đã upload) vào chương
     * Body: { "documentId": 1, "canPreview": true, "orderIndex": 0 }
     */
    @PostMapping("/chapters/{chapterId}/files")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<RoadmapFileResponse> addFile(
            @PathVariable Long chapterId,
            @RequestBody AddFileRequest req) {
        return ResponseEntity.ok(roadmapService.addFile(chapterId, req));
    }

    /**
     * DELETE /api/roadmaps/files/{fileId}
     * Xóa file khỏi chương (không xóa Document gốc)
     */
    @DeleteMapping("/files/{fileId}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<MessageResponse> removeFile(@PathVariable Long fileId) {
        roadmapService.removeFile(fileId);
        return ResponseEntity.ok(new MessageResponse("Đã xóa file khỏi chương!"));
    }
}
