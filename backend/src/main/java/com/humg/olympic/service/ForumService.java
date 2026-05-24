package com.humg.olympic.service;

import com.humg.olympic.dto.CreateForumPostRequest;
import com.humg.olympic.dto.ForumPostResponse;
import com.humg.olympic.entity.ForumLike;
import com.humg.olympic.entity.ForumPost;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.ForumLikeRepository;
import com.humg.olympic.repository.ForumPostRepository;
import com.humg.olympic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumPostRepository postRepo;
    private final ForumLikeRepository likeRepo;
    private final UserRepository      userRepo;

    // ── Lấy danh sách bài gốc (phân trang) ───────────────────────────────
    @Transactional(readOnly = true)
    public Page<ForumPostResponse> getThreads(String subject, String search,
                                               int page, int size,
                                               UserHumg me) {
        String subjectParam = (subject == null || subject.isBlank() || subject.equals("Tất cả"))
                ? null : subject;
        String searchParam  = (search  == null || search.isBlank())  ? null : search;

        Pageable pageable = PageRequest.of(page, size);
        Page<ForumPost> raw = postRepo.findThreads(subjectParam, searchParam, pageable);

        return raw.map(p -> toResponse(p, me, true));
    }

    // ── Lấy chi tiết 1 bài gốc + danh sách bình luận ────────────────────
    @Transactional
    public ForumPostResponse getThread(Long id, UserHumg me) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        if (post.getIsHidden()) throw new RuntimeException("Bài viết đã bị ẩn");

        postRepo.incrementView(id);
        post.setViewCount(post.getViewCount() + 1);

        ForumPostResponse resp = toResponse(post, me, true);

        // Comments
        List<ForumPostResponse> comments = postRepo.findComments(id)
                .stream()
                .map(c -> toResponse(c, me, false))
                .collect(Collectors.toList());
        // Gắn comments vào field tạm — trả riêng
        // (trả về cả 2 qua wrapper nếu cần; ở đây trả post có commentCount)
        return resp;
    }

    // ── Lấy bình luận của 1 bài gốc ─────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ForumPostResponse> getComments(Long parentId, UserHumg me) {
        return postRepo.findComments(parentId)
                .stream()
                .map(c -> toResponse(c, me, false))
                .collect(Collectors.toList());
    }

    // ── Tạo bài mới hoặc bình luận ───────────────────────────────────────
    @Transactional
    public ForumPostResponse create(CreateForumPostRequest req, UserHumg author) {
        ForumPost parent = null;
        if (req.getParentId() != null) {
            parent = postRepo.findById(req.getParentId())
                    .orElseThrow(() -> new RuntimeException("Bài gốc không tồn tại"));
        }

        // Bài gốc phải có tiêu đề
        if (parent == null && (req.getTitle() == null || req.getTitle().isBlank())) {
            throw new RuntimeException("Tiêu đề không được bỏ trống");
        }

        ForumPost post = ForumPost.builder()
                .parent(parent)
                .author(author)
                .title(req.getTitle())
                .content(req.getContent())
                .subject(req.getSubject() != null ? req.getSubject() : "Chung")
                .tags(req.getTags())
                .build();

        return toResponse(postRepo.save(post), author, true);
    }

    // ── Chỉnh sửa bài ───────────────────────────────────────────────────
    @Transactional
    public ForumPostResponse update(Long id, CreateForumPostRequest req, UserHumg me) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        boolean isOwner = post.getAuthor().getId().equals(me.getId());
        boolean isAdmin  = me.getRole().equals("ADMIN") || me.getRole().equals("TEACHER");
        if (!isOwner && !isAdmin) throw new AccessDeniedException("Không có quyền chỉnh sửa");

        if (req.getTitle()   != null) post.setTitle(req.getTitle());
        if (req.getContent() != null) post.setContent(req.getContent());
        if (req.getSubject() != null) post.setSubject(req.getSubject());
        if (req.getTags()    != null) post.setTags(req.getTags());

        return toResponse(postRepo.save(post), me, true);
    }

    // ── Xóa bài ─────────────────────────────────────────────────────────
    @Transactional
    public void delete(Long id, UserHumg me) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        boolean isOwner = post.getAuthor().getId().equals(me.getId());
        boolean isAdmin  = me.getRole().equals("ADMIN") || me.getRole().equals("TEACHER");
        if (!isOwner && !isAdmin) throw new AccessDeniedException("Không có quyền xóa");

        postRepo.delete(post);
    }

    // ── Ghim / Bỏ ghim (Teacher, Admin) ─────────────────────────────────
    @Transactional
    public ForumPostResponse togglePin(Long id, UserHumg me) {
        if (!me.getRole().equals("TEACHER") && !me.getRole().equals("ADMIN")
                && !me.getRole().equals("MANAGER")) {
            throw new AccessDeniedException("Chỉ giảng viên hoặc admin mới có thể ghim");
        }
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        post.setIsPinned(!post.getIsPinned());
        return toResponse(postRepo.save(post), me, true);
    }

    // ── Ẩn / Hiện bài (Teacher, Admin) ───────────────────────────────────
    @Transactional
    public ForumPostResponse toggleHide(Long id, UserHumg me) {
        if (!me.getRole().equals("TEACHER") && !me.getRole().equals("ADMIN")
                && !me.getRole().equals("MANAGER")) {
            throw new AccessDeniedException("Không có quyền");
        }
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        post.setIsHidden(!post.getIsHidden());
        return toResponse(postRepo.save(post), me, true);
    }

    // ── Like / Unlike ────────────────────────────────────────────────────
    @Transactional
    public ForumPostResponse toggleLike(Long id, UserHumg me) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        boolean alreadyLiked = likeRepo.existsByPostAndUser(post, me);
        if (alreadyLiked) {
            likeRepo.deleteByPostAndUser(post, me);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        } else {
            likeRepo.save(ForumLike.builder().post(post).user(me).build());
            post.setLikeCount(post.getLikeCount() + 1);
        }

        postRepo.save(post);
        ForumPostResponse resp = toResponse(post, me, true);
        resp.setLikedByMe(!alreadyLiked);
        return resp;
    }

    // ── Map entity → DTO ─────────────────────────────────────────────────
    private ForumPostResponse toResponse(ForumPost p, UserHumg me, boolean countComments) {
        boolean liked = me != null && likeRepo.existsByPostAndUser(p, me);
        long comments  = countComments ? postRepo.countComments(p.getId()) : 0;

        return ForumPostResponse.builder()
                .id(p.getId())
                .parentId(p.getParent() != null ? p.getParent().getId() : null)
                .authorId(p.getAuthor().getId())
                .authorName(p.getAuthor().getFullName())
                .authorAvatar(p.getAuthor().getAvatarUrl())
                .authorRole(p.getAuthor().getRole())
                .title(p.getTitle())
                .content(p.getContent())
                .subject(p.getSubject())
                .tags(p.getTags())
                .isPinned(p.getIsPinned())
                .isHidden(p.getIsHidden())
                .viewCount(p.getViewCount())
                .likeCount(p.getLikeCount())
                .commentCount(comments)
                .likedByMe(liked)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}