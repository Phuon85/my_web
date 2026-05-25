package com.humg.olympic.service;

import com.humg.olympic.dto.CreateNewsRequest;
import com.humg.olympic.dto.NewsPostResponse;
import com.humg.olympic.entity.NewsPost;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.NewsPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsPostRepository newsRepo;

    private boolean isMod(UserHumg me) {
        String r = me.getRole();
        return "ADMIN".equals(r) || "MANAGER".equals(r) || "TEACHER".equals(r);
    }

    // ── Danh sách tin đã xuất bản ────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<NewsPostResponse> getPublished(String category, String search,
                                               int page, int size) {
        // Chuẩn hóa category: frontend gửi lowercase (announcement, contest...),
        // entity lưu uppercase (ANNOUNCEMENT, CONTEST...)
        String catParam = normalizeCategory(category);
        String searchParam = (search == null || search.isBlank()) ? null : search;

        return newsRepo.findPublished(catParam, searchParam, PageRequest.of(page, size))
                       .map(this::toResponse);
    }

    // ── Tin nổi bật ─────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<NewsPostResponse> getFeatured() {
        return newsRepo.findTop5ByIsPublishedTrueAndIsFeaturedTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Chi tiết 1 tin ───────────────────────────────────────────────────
    // Admin/Teacher có thể xem cả draft; user thường chỉ xem published
    @Transactional
    public NewsPostResponse getById(Long id, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));

        // Block draft với người dùng thường
        if (!Boolean.TRUE.equals(news.getIsPublished()) && (me == null || !isMod(me))) {
            throw new RuntimeException("Bài tin chưa xuất bản");
        }

        newsRepo.incrementView(id);
        news.setViewCount(news.getViewCount() + 1);
        return toResponse(news);
    }

    // ── Admin: tất cả tin (kể cả draft), có filter ───────────────────────
    @Transactional(readOnly = true)
    public Page<NewsPostResponse> adminGetAll(String category, String search,
                                              int page, int size) {
        String catParam    = normalizeCategory(category);
        String searchParam = (search == null || search.isBlank()) ? null : search;

        // Dùng findPublished nhưng bỏ filter isPublished — cần query riêng
        return newsRepo.findAllForAdmin(catParam, searchParam, PageRequest.of(page, size))
                       .map(this::toResponse);
    }

    // ── Tạo bài tin ─────────────────────────────────────────────────────
    @Transactional
    public NewsPostResponse create(CreateNewsRequest req, UserHumg author) {
        String cat = req.getCategory() != null
                ? req.getCategory().toUpperCase()
                : "GENERAL";

        NewsPost news = NewsPost.builder()
                .author(author)
                .title(req.getTitle())
                .summary(req.getSummary())
                .content(req.getContent())
                .coverUrl(req.getCoverUrl())
                .category(cat)
                .isPublished(Boolean.TRUE.equals(req.getIsPublished()))
                .isFeatured(Boolean.TRUE.equals(req.getIsFeatured()))
                .build();

        return toResponse(newsRepo.save(news));
    }

    // ── Sửa bài tin ─────────────────────────────────────────────────────
    @Transactional
    public NewsPostResponse update(Long id, CreateNewsRequest req, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));

        if (!news.getAuthor().getId().equals(me.getId()) && !isMod(me))
            throw new AccessDeniedException("Không có quyền sửa");

        if (req.getTitle()       != null) news.setTitle(req.getTitle());
        if (req.getSummary()     != null) news.setSummary(req.getSummary());
        if (req.getContent()     != null) news.setContent(req.getContent());
        if (req.getCoverUrl()    != null) news.setCoverUrl(req.getCoverUrl());
        if (req.getCategory()    != null) news.setCategory(req.getCategory().toUpperCase());
        if (req.getIsPublished() != null) news.setIsPublished(req.getIsPublished());
        if (req.getIsFeatured()  != null) news.setIsFeatured(req.getIsFeatured());

        return toResponse(newsRepo.save(news));
    }

    // ── Xuất bản / Thu hồi ───────────────────────────────────────────────
    @Transactional
    public NewsPostResponse togglePublish(Long id, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));
        news.setIsPublished(!Boolean.TRUE.equals(news.getIsPublished()));
        return toResponse(newsRepo.save(news));
    }

    // ── Nổi bật / Bỏ nổi bật ────────────────────────────────────────────
    @Transactional
    public NewsPostResponse toggleFeatured(Long id, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));
        news.setIsFeatured(!Boolean.TRUE.equals(news.getIsFeatured()));
        return toResponse(newsRepo.save(news));
    }

    // ── Xóa ─────────────────────────────────────────────────────────────
    @Transactional
    public void delete(Long id, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));
        if (!news.getAuthor().getId().equals(me.getId()) && !isMod(me))
            throw new AccessDeniedException("Không có quyền xóa");
        newsRepo.delete(news);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    /** Frontend gửi lowercase, entity lưu UPPERCASE */
    private String normalizeCategory(String category) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category))
            return null;
        return category.toUpperCase();
    }

    private NewsPostResponse toResponse(NewsPost n) {
        return NewsPostResponse.builder()
                .id(n.getId())
                .authorId(n.getAuthor().getId())
                .authorName(n.getAuthor().getFullName())
                .authorAvatar(n.getAuthor().getAvatarUrl())
                .title(n.getTitle())
                .summary(n.getSummary())
                .content(n.getContent())
                .coverUrl(n.getCoverUrl())
                .category(n.getCategory() != null ? n.getCategory().toLowerCase() : "general")
                .isPublished(n.getIsPublished())
                .isFeatured(n.getIsFeatured())
                .viewCount(n.getViewCount())
                .publishedAt(Boolean.TRUE.equals(n.getIsPublished()) ? n.getUpdatedAt() : null)
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
