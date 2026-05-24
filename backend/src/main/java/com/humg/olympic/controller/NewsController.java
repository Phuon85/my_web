package com.humg.olympic.controller;

import com.humg.olympic.dto.CreateNewsRequest;
import com.humg.olympic.dto.MessageResponse;
import com.humg.olympic.dto.NewsPostResponse;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.UserRepository;
import com.humg.olympic.service.NewsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService    newsService;
    private final UserRepository userRepo;

    private UserHumg me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    /**
     * GET /api/news
     * Danh sách tin đã xuất bản (phân trang)
     * Params: category, search, page, size
     */
    @GetMapping
    public ResponseEntity<Page<NewsPostResponse>> getPublished(
            @RequestParam(required = false)    String category,
            @RequestParam(required = false)    String search,
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "10") int    size) {
        return ResponseEntity.ok(newsService.getPublished(category, search, page, size));
    }

    /**
     * GET /api/news/featured
     * Tin nổi bật (dùng cho widget trang chủ)
     */
    @GetMapping("/featured")
    public ResponseEntity<List<NewsPostResponse>> getFeatured() {
        return ResponseEntity.ok(newsService.getFeatured());
    }

    /**
     * GET /api/news/{id}
     * Chi tiết 1 bài tin (tăng lượt xem)
     */
    @GetMapping("/{id}")
    public ResponseEntity<NewsPostResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.getById(id));
    }

    /**
     * GET /api/news/admin/all
     * Admin: xem tất cả kể cả draft
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','MANAGER')")
    public ResponseEntity<Page<NewsPostResponse>> adminGetAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(newsService.adminGetAll(page, size));
    }

    /**
     * POST /api/news
     * Tạo bài tin mới (Teacher/Admin)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','MANAGER')")
    public ResponseEntity<NewsPostResponse> create(
            @Valid @RequestBody CreateNewsRequest req) {
        return ResponseEntity.ok(newsService.create(req, me()));
    }

    /**
     * PUT /api/news/{id}
     * Sửa bài tin
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','MANAGER')")
    public ResponseEntity<NewsPostResponse> update(
            @PathVariable Long id,
            @RequestBody  CreateNewsRequest req) {
        return ResponseEntity.ok(newsService.update(id, req, me()));
    }

    /**
     * PATCH /api/news/{id}/publish
     * Xuất bản / Thu hồi
     */
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','MANAGER')")
    public ResponseEntity<NewsPostResponse> togglePublish(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.togglePublish(id, me()));
    }

    /**
     * PATCH /api/news/{id}/feature
     * Đặt / Bỏ nổi bật
     */
    @PatchMapping("/{id}/feature")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<NewsPostResponse> toggleFeatured(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.toggleFeatured(id, me()));
    }

    /**
     * DELETE /api/news/{id}
     * Xóa bài tin
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        newsService.delete(id, me());
        return ResponseEntity.ok(new MessageResponse("Đã xóa bài tin"));
    }
}