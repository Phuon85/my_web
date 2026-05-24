package com.humg.olympic.controller;

import com.humg.olympic.dto.CreateForumPostRequest;
import com.humg.olympic.dto.ForumPostResponse;
import com.humg.olympic.dto.MessageResponse;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.UserRepository;
import com.humg.olympic.service.ForumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService     forumService;
    private final UserRepository   userRepo;

    // ── Lấy người dùng hiện tại ──────────────────────────────────────────
    private UserHumg me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    // ── Có thể là anonymous (cho public read) ────────────────────────────
    private UserHumg meOrNull() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()
                    || "anonymousUser".equals(auth.getPrincipal())) return null;
            return me();
        } catch (Exception e) { return null; }
    }

    /**
     * GET /api/forum/threads
     * Danh sách bài gốc (phân trang)
     * Params: subject, search, page, size
     */
    @GetMapping("/threads")
    public ResponseEntity<Page<ForumPostResponse>> getThreads(
            @RequestParam(required = false)              String subject,
            @RequestParam(required = false)              String search,
            @RequestParam(defaultValue = "0")            int    page,
            @RequestParam(defaultValue = "10")           int    size) {
        return ResponseEntity.ok(forumService.getThreads(subject, search, page, size, meOrNull()));
    }

    /**
     * GET /api/forum/threads/{id}
     * Chi tiết 1 bài gốc (đồng thời tăng view)
     */
    @GetMapping("/threads/{id}")
    public ResponseEntity<ForumPostResponse> getThread(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getThread(id, meOrNull()));
    }

    /**
     * GET /api/forum/threads/{id}/comments
     * Lấy tất cả bình luận của bài gốc
     */
    @GetMapping("/threads/{id}/comments")
    public ResponseEntity<List<ForumPostResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getComments(id, meOrNull()));
    }

    /**
     * POST /api/forum/posts
     * Tạo bài gốc hoặc bình luận (parentId = null → bài gốc)
     */
    @PostMapping("/posts")
    public ResponseEntity<ForumPostResponse> create(
            @Valid @RequestBody CreateForumPostRequest req) {
        return ResponseEntity.ok(forumService.create(req, me()));
    }

    /**
     * PUT /api/forum/posts/{id}
     * Sửa bài (owner hoặc Teacher/Admin)
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<ForumPostResponse> update(
            @PathVariable Long id,
            @RequestBody  CreateForumPostRequest req) {
        return ResponseEntity.ok(forumService.update(id, req, me()));
    }

    /**
     * DELETE /api/forum/posts/{id}
     * Xóa bài (owner hoặc Teacher/Admin)
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        forumService.delete(id, me());
        return ResponseEntity.ok(new MessageResponse("Đã xóa bài viết"));
    }

    /**
     * PATCH /api/forum/posts/{id}/pin
     * Ghim / Bỏ ghim (Teacher/Admin)
     */
    @PatchMapping("/posts/{id}/pin")
    public ResponseEntity<ForumPostResponse> togglePin(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.togglePin(id, me()));
    }

    /**
     * PATCH /api/forum/posts/{id}/hide
     * Ẩn / Hiện bài (Teacher/Admin)
     */
    @PatchMapping("/posts/{id}/hide")
    public ResponseEntity<ForumPostResponse> toggleHide(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.toggleHide(id, me()));
    }

    /**
     * PATCH /api/forum/posts/{id}/like
     * Like / Unlike
     */
    @PatchMapping("/posts/{id}/like")
    public ResponseEntity<ForumPostResponse> toggleLike(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.toggleLike(id, me()));
    }
}