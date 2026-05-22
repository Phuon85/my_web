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

    private final ContestRepository contestRepository;
    private final UserRepository    userRepository;

    public List<ContestResponse> getAll(String subject, String status) {
        List<Contest> list;
        if (subject != null && !subject.isBlank()) {
            list = contestRepository.findPublished(subject, status);
        } else {
            list = contestRepository.findByIsPublishedTrueOrderByStartTimeAsc();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ContestResponse getById(Long id) {
        Contest c = contestRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Không tìm thấy cuộc thi id=" + id));
        return toResponse(c);
    }

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

    @Transactional
    public ContestResponse update(Long id, CreateContestRequest req) {
        Contest c = contestRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Không tìm thấy cuộc thi id=" + id));

        if (req.getTitle() != null)           c.setTitle(req.getTitle());
        if (req.getDescription() != null)     c.setDescription(req.getDescription());
        if (req.getSubject() != null)         c.setSubject(req.getSubject());
        if (req.getStartTime() != null)       c.setStartTime(req.getStartTime());
        if (req.getEndTime() != null)         c.setEndTime(req.getEndTime());
        if (req.getDurationMinutes() != null) c.setDurationMinutes(req.getDurationMinutes());
        if (req.getPrizeFirst() != null)      c.setPrizeFirst(req.getPrizeFirst());

        contestRepository.save(c);
        return toResponse(c);
    }

    @Transactional
    public void publish(Long id) {
        Contest c = contestRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Không tìm thấy cuộc thi id=" + id));
        c.setIsPublished(true);
        c.setStatus("PUBLISHED");
        contestRepository.save(c);
    }

    @Transactional
    public void delete(Long id) {
        if (!contestRepository.existsById(id))
            throw new jakarta.persistence.EntityNotFoundException("Không tìm thấy cuộc thi");
        contestRepository.deleteById(id);
    }

    @Transactional
    public void register(Long contestId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Không tìm thấy cuộc thi"));
        if (!contest.getIsPublished())
            throw new IllegalArgumentException("Cuộc thi chưa được công bố");
        // TODO: lưu vào contest_participant
    }

    private ContestResponse toResponse(Contest c) {
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
                .registrantCount(0)
                .creatorName(c.getCreator() != null ? c.getCreator().getFullName() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
