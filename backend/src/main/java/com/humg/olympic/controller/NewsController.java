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

    private UserHumg meOrNull() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()
                    || "anonymousUser".equals(auth.getPrincipal())) return null;
            return me();
        } catch (Exception e) { return null; }
    }

    /** GET /api/news — danh sách đã xuất bản */
    @GetMapping
    public ResponseEntity<Page<NewsPostResponse>> getPublished(
            @RequestParam(required = false)    String category,
            @RequestParam(required = false)    String search,
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "10") int    size) {
        return ResponseEntity.ok(newsService.getPublished(category, search, page, size));
    }

    /** GET /api/news/featured — tin nổi bật */
    @GetMapping("/featured")
    public ResponseEntity<List<NewsPostResponse>> getFeatured() {
        return ResponseEntity.ok(newsService.getFeatured());
    }

    /** GET /api/news/admin/all — admin xem tất cả kể cả draft */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','MANAGER')")
    public ResponseEntity<Page<NewsPostResponse>> adminGetAll(
            @RequestParam(required = false)    String category,
            @RequestParam(required = false)    String search,
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "20") int    size) {
        return ResponseEntity.ok(newsService.adminGetAll(category, search, page, size));
    }

    /** GET /api/news/{id} — chi tiết (admin thấy cả draft) */
    @GetMapping("/{id}")
    public ResponseEntity<NewsPostResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.getById(id, meOrNull()));
    }

    /** POST /api/news — tạo bài tin */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','MANAGER')")
    public ResponseEntity<NewsPostResponse> create(
            @Valid @RequestBody CreateNewsRequest req) {
        return ResponseEntity.ok(newsService.create(req, me()));
    }

    /** PUT /api/news/{id} — sửa bài tin */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','MANAGER')")
    public ResponseEntity<NewsPostResponse> update(
            @PathVariable Long id,
            @RequestBody  CreateNewsRequest req) {
        return ResponseEntity.ok(newsService.update(id, req, me()));
    }

    /** PATCH /api/news/{id}/publish — xuất bản / thu hồi */
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','MANAGER')")
    public ResponseEntity<NewsPostResponse> togglePublish(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.togglePublish(id, me()));
    }

    /** PATCH /api/news/{id}/feature — nổi bật / bỏ nổi bật */
    @PatchMapping("/{id}/feature")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<NewsPostResponse> toggleFeatured(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.toggleFeatured(id, me()));
    }

    /** DELETE /api/news/{id} — xóa bài tin */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<MessageResponse> delete(@PathVariable Long id) {
        newsService.delete(id, me());
        return ResponseEntity.ok(new MessageResponse("Đã xóa bài tin"));
    }
}
