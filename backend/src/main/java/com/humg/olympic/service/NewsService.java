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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsPostRepository newsRepo;

    // ── Danh sách tin đã xuất bản (có phân trang, lọc, tìm kiếm) ────────
    @Transactional(readOnly = true)
    public Page<NewsPostResponse> getPublished(String category, String search,
                                               int page, int size) {
        String catParam    = (category == null || category.isBlank() || category.equals("Tất cả"))
                ? null : category;
        String searchParam = (search == null || search.isBlank()) ? null : search;

        Pageable pageable = PageRequest.of(page, size);
        return newsRepo.findPublished(catParam, searchParam, pageable)
                       .map(this::toResponse);
    }

    // ── Tin nổi bật (dùng cho trang chủ) ────────────────────────────────
    @Transactional(readOnly = true)
    public List<NewsPostResponse> getFeatured() {
        return newsRepo.findTop5ByIsPublishedTrueAndIsFeaturedTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Chi tiết 1 tin ───────────────────────────────────────────────────
    @Transactional
    public NewsPostResponse getById(Long id) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));
        if (!news.getIsPublished()) throw new RuntimeException("Bài tin chưa xuất bản");
        newsRepo.incrementView(id);
        news.setViewCount(news.getViewCount() + 1);
        return toResponse(news);
    }

    // ── Admin: lấy tất cả (kể cả draft) ─────────────────────────────────
    @Transactional(readOnly = true)
    public Page<NewsPostResponse> adminGetAll(int page, int size) {
        return newsRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                       .map(this::toResponse);
    }

    // ── Tạo bài tin mới (Teacher/Admin) ─────────────────────────────────
    @Transactional
    public NewsPostResponse create(CreateNewsRequest req, UserHumg author) {
        NewsPost news = NewsPost.builder()
                .author(author)
                .title(req.getTitle())
                .summary(req.getSummary())
                .content(req.getContent())
                .coverUrl(req.getCoverUrl())
                .category(req.getCategory() != null ? req.getCategory() : "GENERAL")
                .isPublished(req.getIsPublished() != null && req.getIsPublished())
                .isFeatured(req.getIsFeatured() != null && req.getIsFeatured())
                .build();
        return toResponse(newsRepo.save(news));
    }

    // ── Chỉnh sửa bài tin ───────────────────────────────────────────────
    @Transactional
    public NewsPostResponse update(Long id, CreateNewsRequest req, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));

        boolean isOwner = news.getAuthor().getId().equals(me.getId());
        boolean isAdmin  = me.getRole().equals("ADMIN");
        if (!isOwner && !isAdmin) throw new AccessDeniedException("Không có quyền sửa");

        if (req.getTitle()   != null) news.setTitle(req.getTitle());
        if (req.getSummary() != null) news.setSummary(req.getSummary());
        if (req.getContent() != null) news.setContent(req.getContent());
        if (req.getCoverUrl()!= null) news.setCoverUrl(req.getCoverUrl());
        if (req.getCategory()!= null) news.setCategory(req.getCategory());
        if (req.getIsPublished() != null) news.setIsPublished(req.getIsPublished());
        if (req.getIsFeatured()  != null) news.setIsFeatured(req.getIsFeatured());

        return toResponse(newsRepo.save(news));
    }

    // ── Xuất bản / Thu hồi ───────────────────────────────────────────────
    @Transactional
    public NewsPostResponse togglePublish(Long id, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));
        news.setIsPublished(!news.getIsPublished());
        return toResponse(newsRepo.save(news));
    }

    // ── Nổi bật / Bỏ nổi bật ────────────────────────────────────────────
    @Transactional
    public NewsPostResponse toggleFeatured(Long id, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));
        news.setIsFeatured(!news.getIsFeatured());
        return toResponse(newsRepo.save(news));
    }

    // ── Xóa bài tin ─────────────────────────────────────────────────────
    @Transactional
    public void delete(Long id, UserHumg me) {
        NewsPost news = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tin"));

        boolean isOwner = news.getAuthor().getId().equals(me.getId());
        boolean isAdmin  = me.getRole().equals("ADMIN");
        if (!isOwner && !isAdmin) throw new AccessDeniedException("Không có quyền xóa");

        newsRepo.delete(news);
    }

    // ── Map entity → DTO ─────────────────────────────────────────────────
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
                .category(n.getCategory())
                .isPublished(n.getIsPublished())
                .isFeatured(n.getIsFeatured())
                .viewCount(n.getViewCount())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}