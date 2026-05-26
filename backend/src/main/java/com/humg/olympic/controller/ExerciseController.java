package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.ExerciseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    // ════════════════════════════════════════════════════════════════════════
    //  BÀI TẬP — CRUD
    // ════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/exercises
     * - Student: chỉ thấy bài đã published
     * - Teacher+: thấy tất cả kể cả nháp
     */
    @GetMapping
    public ResponseEntity<List<ExerciseResponse>> getAll(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(exerciseService.getAll(subject, level, type));
    }

    /**
     * GET /api/exercises/{id}
     * Trả về bài tập kèm danh sách câu hỏi (ẩn đáp án đúng với student)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ExerciseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.getById(id));
    }

    /**
     * POST /api/exercises  — Teacher/Manager/Admin
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<ExerciseResponse> create(
            @Valid @RequestBody CreateExerciseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(exerciseService.create(req));
    }

    /**
     * PUT /api/exercises/{id}  — Teacher/Manager/Admin
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<ExerciseResponse> update(
            @PathVariable Long id,
            @RequestBody CreateExerciseRequest req) {
        return ResponseEntity.ok(exerciseService.update(id, req));
    }

    /**
     * PATCH /api/exercises/{id}/publish  — toggle xuất bản / về nháp
     */
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<ExerciseResponse> togglePublish(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.togglePublish(id));
    }

    /**
     * DELETE /api/exercises/{id}  — Admin only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        exerciseService.delete(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa bài tập!"));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  CÂU HỎI — CRUD
    // ════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/exercises/{id}/questions  — Thêm câu hỏi
     */
    @PostMapping("/{id}/questions")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<QuestionResponse> addQuestion(
            @PathVariable Long id,
            @RequestBody CreateQuestionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(exerciseService.addQuestion(id, req));
    }

    /**
     * PUT /api/exercises/{id}/questions/{qId}  — Sửa câu hỏi
     */
    @PutMapping("/{id}/questions/{qId}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable Long id,
            @PathVariable Long qId,
            @RequestBody CreateQuestionRequest req) {
        return ResponseEntity.ok(exerciseService.updateQuestion(id, qId, req));
    }

    /**
     * DELETE /api/exercises/{id}/questions/{qId}  — Xóa câu hỏi
     */
    @DeleteMapping("/{id}/questions/{qId}")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<MessageResponse> deleteQuestion(
            @PathVariable Long id,
            @PathVariable Long qId) {
        exerciseService.deleteQuestion(id, qId);
        return ResponseEntity.ok(new MessageResponse("Đã xóa câu hỏi!"));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  LÀM BÀI & KẾT QUẢ
    // ════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/exercises/{id}/start  — Bắt đầu làm bài (log)
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<MessageResponse> start(@PathVariable Long id) {
        exerciseService.start(id);
        return ResponseEntity.ok(new MessageResponse("Bắt đầu làm bài!"));
    }

    /**
     * POST /api/exercises/{id}/submit  — Nộp bài, chấm điểm tự động
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<ExerciseResultResponse> submit(
            @PathVariable Long id,
            @RequestBody SubmitExerciseRequest req) {
        return ResponseEntity.ok(exerciseService.submit(id, req));
    }

    /**
     * GET /api/exercises/{id}/my-result  — Kết quả lần làm gần nhất của tôi
     */
    @GetMapping("/{id}/my-result")
    public ResponseEntity<ExerciseResultResponse> myResult(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.myResult(id));
    }

    /**
     * GET /api/exercises/{id}/results  — Bảng kết quả (Teacher+)
     */
    @GetMapping("/{id}/results")
    @PreAuthorize("hasAnyRole('TEACHER','MANAGER','ADMIN')")
    public ResponseEntity<List<SubmissionResponse>> getResults(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.getResults(id));
    }
}
