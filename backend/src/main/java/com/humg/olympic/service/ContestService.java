package com.humg.olympic.service;

import com.humg.olympic.dto.*;
import com.humg.olympic.entity.*;
import com.humg.olympic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestRepository             contestRepository;
    private final UserRepository                userRepository;
    private final ContestParticipantRepository  participantRepository;

    // ── Public: danh sách đã công bố ────────────────────────────────────────
    public List<ContestResponse> getAll(String subject, String status) {
        String s = (subject != null && subject.isBlank()) ? null : subject;
        String st = (status  != null && status.isBlank())  ? null : status;
        return contestRepository.findPublished(s, st)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Admin: toàn bộ kỳ thi (kể cả DRAFT) ────────────────────────────────
    public List<ContestResponse> getAll(String search, String status, Boolean published) {
        return contestRepository.findAllAdmin(search, status, published)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Chi tiết 1 kỳ thi ────────────────────────────────────────────────────
    public ContestResponse getById(Long id) {
        Contest c = findOrThrow(id);
        return toResponse(c);
    }

    // ── Tạo kỳ thi ───────────────────────────────────────────────────────────
    @Transactional
    public ContestResponse create(CreateContestRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Contest contest = Contest.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .subject(req.getSubject())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .durationMinutes(req.getDurationMinutes())
                .prizeFirst(req.getPrizeFirst())
                .prizeSecond(req.getPrizeSecond())
                .prizeThird(req.getPrizeThird())
                .creator(creator)
                .status("DRAFT")
                .isPublished(false)
                .build();

        contestRepository.save(contest);
        return toResponse(contest);
    }

    // ── Cập nhật kỳ thi ──────────────────────────────────────────────────────
    @Transactional
    public ContestResponse update(Long id, CreateContestRequest req) {
        Contest c = findOrThrow(id);

        if (req.getTitle()           != null) c.setTitle(req.getTitle());
        if (req.getDescription()     != null) c.setDescription(req.getDescription());
        if (req.getSubject()         != null) c.setSubject(req.getSubject());
        if (req.getStartTime()       != null) c.setStartTime(req.getStartTime());
        if (req.getEndTime()         != null) c.setEndTime(req.getEndTime());
        if (req.getDurationMinutes() != null) c.setDurationMinutes(req.getDurationMinutes());
        if (req.getPrizeFirst()      != null) c.setPrizeFirst(req.getPrizeFirst());
        if (req.getPrizeSecond()     != null) c.setPrizeSecond(req.getPrizeSecond());
        if (req.getPrizeThird()      != null) c.setPrizeThird(req.getPrizeThird());

        contestRepository.save(c);
        return toResponse(c);
    }

    // ── Công bố kỳ thi ───────────────────────────────────────────────────────
    @Transactional
    public void publish(Long id) {
        Contest c = findOrThrow(id);
        c.setIsPublished(true);
        c.setStatus("PUBLISHED");
        contestRepository.save(c);
    }

    // ── Xóa / Khôi phục (soft delete bằng status) ────────────────────────────
    @Transactional
    public void delete(Long id) {
        if (!contestRepository.existsById(id))
            throw new jakarta.persistence.EntityNotFoundException("Không tìm thấy cuộc thi");
        contestRepository.deleteById(id);
    }

    @Transactional
    public ContestResponse softDelete(Long id) {
        Contest c = findOrThrow(id);
        c.setStatus("DELETED");
        c.setIsPublished(false);
        contestRepository.save(c);
        return toResponse(c);
    }

    @Transactional
    public ContestResponse restore(Long id) {
        Contest c = findOrThrow(id);
        c.setStatus("DRAFT");
        contestRepository.save(c);
        return toResponse(c);
    }

    // ── Đăng ký tham dự ───────────────────────────────────────────────────────
    @Transactional
    public void register(Long contestId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        Contest contest = findOrThrow(contestId);

        if (!contest.getIsPublished())
            throw new IllegalArgumentException("Cuộc thi chưa được công bố");

        if (participantRepository.existsByContestIdAndUserId(contestId, user.getId()))
            throw new IllegalArgumentException("Bạn đã đăng ký cuộc thi này rồi");

        participantRepository.save(ContestParticipant.builder()
                .contest(contest)
                .user(user)
                .build());
    }

    // ── Danh sách thí sinh ────────────────────────────────────────────────────
    public List<ContestParticipantResponse> getParticipants(Long contestId) {
        return participantRepository.findByContestIdOrderByScore(contestId)
                .stream()
                .map(cp -> ContestParticipantResponse.builder()
                        .id(cp.getId())
                        .userId(cp.getUser().getId())
                        .fullName(cp.getUser().getFullName())
                        .email(cp.getUser().getEmail())
                        .mssv(cp.getUser().getMssv())
                        .khoa(cp.getUser().getKhoa())
                        .score(cp.getScore())
                        .rankPos(cp.getRankPos())
                        .registeredAt(cp.getRegisteredAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    private Contest findOrThrow(Long id) {
        return contestRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Không tìm thấy cuộc thi id=" + id));
    }

    ContestResponse toResponse(Contest c) {
        long count = participantRepository.countByContestId(c.getId());
        return ContestResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .subject(c.getSubject())
                .status(c.getStatus())
                .startTime(c.getStartTime())
                .endTime(c.getEndTime())
                .durationMinutes(c.getDurationMinutes())
                .prizeFirst(c.getPrizeFirst())
                .prizeSecond(c.getPrizeSecond())
                .prizeThird(c.getPrizeThird())
                .isPublished(c.getIsPublished())
                .registrantCount((int) count)
                .creatorName(c.getCreator() != null ? c.getCreator().getFullName() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}