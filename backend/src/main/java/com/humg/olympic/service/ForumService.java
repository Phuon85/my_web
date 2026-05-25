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

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumPostRepository postRepo;
    private final ForumLikeRepository likeRepo;
    private final UserRepository      userRepo;

    // ── Bảng chuyển đổi category key ↔ subject label ────────────────────
    private static final Map<String,String> CAT_TO_SUBJECT = Map.of(
        "math",    "Toán học",
        "physics", "Vật lý",
        "chem",    "Hóa học",
        "english", "Ngoại ngữ",
        "it",      "CNTT",
        "general", "Chung"
    );
    private static final Map<String,String> SUBJECT_TO_CAT;
    static {
        SUBJECT_TO_CAT = new HashMap<>();
        CAT_TO_SUBJECT.forEach((k, v) -> SUBJECT_TO_CAT.put(v, k));
    }

    private String categoryToSubject(String category) {
        if (category == null || category.isBlank()) return "Chung";
        // Đã là subject label (tiếng Việt) thì giữ nguyên
        if (SUBJECT_TO_CAT.containsKey(category)) return category;
        return CAT_TO_SUBJECT.getOrDefault(category.toLowerCase(), "Chung");
    }

    private String subjectToCategory(String subject) {
        if (subject == null) return "general";
        return SUBJECT_TO_CAT.getOrDefault(subject, "general");
    }

    private String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) return null;
        return tags.stream().map(String::trim).filter(t -> !t.isBlank())
                   .collect(Collectors.joining(","));
    }

    private List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) return Collections.emptyList();
        return Arrays.stream(tags.split(","))
                     .map(String::trim).filter(t -> !t.isBlank())
                     .collect(Collectors.toList());
    }

    private boolean isMod(UserHumg me) {
        String r = me.getRole();
        return "ADMIN".equals(r) || "MANAGER".equals(r) || "TEACHER".equals(r);
    }

    // ── Danh sách bài gốc (phân trang) ──────────────────────────────────
    @Transactional(readOnly = true)
    public Page<ForumPostResponse> getThreads(String category, String sort,
                                               String search, int page, int size,
                                               UserHumg me) {
        // Chuyển category key → subject label để query
        String subjectParam = (category == null || category.isBlank() || "all".equals(category))
                ? null : categoryToSubject(category);
        String searchParam  = (search  == null || search.isBlank()) ? null : search;

        // Sort: popular → likeCount DESC; default → isPinned DESC, createdAt DESC
        Pageable pageable = "popular".equals(sort)
                ? PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "likeCount", "createdAt"))
                : PageRequest.of(page, size);

        Page<ForumPost> raw = postRepo.findThreads(subjectParam, searchParam, pageable);

        // unanswered: lọc sau query (chấp nhận N+1 nhỏ vì size nhỏ)
        if ("unanswered".equals(sort)) {
            List<ForumPostResponse> filtered = raw.getContent().stream()
                    .filter(p -> postRepo.countComments(p.getId()) == 0)
                    .map(p -> toResponse(p, me, true))
                    .collect(Collectors.toList());
            return new PageImpl<>(filtered, pageable, filtered.size());
        }

        return raw.map(p -> toResponse(p, me, true));
    }

    // ── Chi tiết bài gốc ────────────────────────────────────────────────
    @Transactional
    public ForumPostResponse getThread(Long id, UserHumg me) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        if (Boolean.TRUE.equals(post.getIsHidden()))
            throw new RuntimeException("Bài viết đã bị ẩn");

        postRepo.incrementView(id);
        post.setViewCount(post.getViewCount() + 1);
        return toResponse(post, me, true);
    }

    // ── Bình luận của bài gốc ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ForumPostResponse> getComments(Long parentId, UserHumg me) {
        return postRepo.findComments(parentId).stream()
                .map(c -> toResponse(c, me, false))
                .collect(Collectors.toList());
    }

    // ── Tạo bài / bình luận ─────────────────────────────────────────────
    @Transactional
    public ForumPostResponse create(CreateForumPostRequest req, UserHumg author) {
        ForumPost parent = null;
        if (req.getParentId() != null) {
            parent = postRepo.findById(req.getParentId())
                    .orElseThrow(() -> new RuntimeException("Bài gốc không tồn tại"));
        }
        if (parent == null && (req.getTitle() == null || req.getTitle().isBlank())) {
            throw new RuntimeException("Tiêu đề không được bỏ trống");
        }

        // Ưu tiên category key, fallback subject label
        String subject = "Chung";
        if (req.getCategory() != null && !req.getCategory().isBlank()) {
            subject = categoryToSubject(req.getCategory());
        } else if (req.getSubject() != null && !req.getSubject().isBlank()) {
            subject = req.getSubject();
        }

        ForumPost post = ForumPost.builder()
                .parent(parent)
                .author(author)
                .title(req.getTitle())
                .content(req.getContent())
                .subject(subject)
                .tags(joinTags(req.getTags()))
                .build();

        return toResponse(postRepo.save(post), author, true);
    }

    // ── Sửa bài ─────────────────────────────────────────────────────────
    @Transactional
    public ForumPostResponse update(Long id, CreateForumPostRequest req, UserHumg me) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        if (!post.getAuthor().getId().equals(me.getId()) && !isMod(me))
            throw new AccessDeniedException("Không có quyền chỉnh sửa");

        if (req.getTitle()    != null) post.setTitle(req.getTitle());
        if (req.getContent()  != null) post.setContent(req.getContent());
        if (req.getCategory() != null) post.setSubject(categoryToSubject(req.getCategory()));
        else if (req.getSubject() != null) post.setSubject(req.getSubject());
        if (req.getTags()     != null) post.setTags(joinTags(req.getTags()));

        return toResponse(postRepo.save(post), me, true);
    }

    // ── Xóa bài ─────────────────────────────────────────────────────────
    @Transactional
    public void delete(Long id, UserHumg me) {
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        if (!post.getAuthor().getId().equals(me.getId()) && !isMod(me))
            throw new AccessDeniedException("Không có quyền xóa");
        postRepo.delete(post);
    }

    // ── Ghim / Bỏ ghim ──────────────────────────────────────────────────
    @Transactional
    public ForumPostResponse togglePin(Long id, UserHumg me) {
        if (!isMod(me)) throw new AccessDeniedException("Chỉ giảng viên hoặc admin mới có thể ghim");
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        post.setIsPinned(!Boolean.TRUE.equals(post.getIsPinned()));
        return toResponse(postRepo.save(post), me, true);
    }

    // ── Ẩn / Hiện ───────────────────────────────────────────────────────
    @Transactional
    public ForumPostResponse toggleHide(Long id, UserHumg me) {
        if (!isMod(me)) throw new AccessDeniedException("Không có quyền");
        ForumPost post = postRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        post.setIsHidden(!Boolean.TRUE.equals(post.getIsHidden()));
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
        boolean liked    = me != null && likeRepo.existsByPostAndUser(p, me);
        long    comments = countComments ? postRepo.countComments(p.getId()) : 0;

        return ForumPostResponse.builder()
                .id(p.getId())
                .parentId(p.getParent() != null ? p.getParent().getId() : null)
                .authorId(p.getAuthor().getId())
                .authorName(p.getAuthor().getFullName())
                .authorAvatar(p.getAuthor().getAvatarUrl())
                .authorRole(p.getAuthor().getRole())
                .title(p.getTitle())
                .content(p.getContent())
                .category(subjectToCategory(p.getSubject()))
                .tags(splitTags(p.getTags()))
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
