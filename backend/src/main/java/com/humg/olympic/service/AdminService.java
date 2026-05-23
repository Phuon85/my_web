package com.humg.olympic.service;

import com.humg.olympic.dto.*;
import com.humg.olympic.entity.ActivityLog;
import com.humg.olympic.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository              userRepository;
    private final ContestRepository           contestRepository;
    private final DocumentRepository          documentRepository;
    private final RoadmapRepository           roadmapRepository;
    private final ContestParticipantRepository participantRepository;
    private final ActivityLogRepository       logRepository;

    // ── Dashboard stats ──────────────────────────────────────────────────────
    public AdminDashboardResponse getDashboard() {
        return AdminDashboardResponse.builder()
                .totalUsers(      userRepository.count())
                .activeUsers(     userRepository.countByIsActive(true))
                .totalContests(   contestRepository.count())
                .liveContests(    contestRepository.countByStatus("LIVE"))
                .totalDocuments(  documentRepository.count())
                .totalRoadmaps(   roadmapRepository.count())
                .totalRegistrations(participantRepository.count())
                .build();
    }

    // ── Logs ─────────────────────────────────────────────────────────────────
    public List<ActivityLogResponse> getLogs(String action, String search, int page, int size) {
        String a = (action != null && action.isBlank()) ? null : action;
        String s = (search != null && search.isBlank()) ? null : search;
        return logRepository.findLogs(a, s, PageRequest.of(page, size))
                .stream()
                .map(this::toLogResponse)
                .collect(Collectors.toList());
    }

    public void saveLog(ActivityLog log) {
        logRepository.save(log);
    }

    private ActivityLogResponse toLogResponse(ActivityLog l) {
        return ActivityLogResponse.builder()
                .id(l.getId())
                .userName( l.getUser() != null ? l.getUser().getFullName() : "System")
                .userEmail(l.getUser() != null ? l.getUser().getEmail()    : "—")
                .action(l.getAction())
                .entityType(l.getEntityType())
                .entityId(l.getEntityId())
                .detail(l.getDetail())
                .ipAddress(l.getIpAddress())
                .createdAt(l.getCreatedAt())
                .build();
    }
}