package com.humg.olympic.service;

import com.humg.olympic.dto.*;
import com.humg.olympic.entity.Team;
import com.humg.olympic.entity.TeamMember;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.TeamMemberRepository;
import com.humg.olympic.entity.TeamRole;
import com.humg.olympic.repository.TeamRepository;
import com.humg.olympic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepo;
    private final TeamMemberRepository memberRepo;
    private final UserRepository userRepo;

    // ── Helper: Map entity → response ──────────────────────────────────────
    private TeamMemberResponse toMemberResponse(TeamMember m) {
        UserHumg u = m.getUser();
        return TeamMemberResponse.builder()
                .memberId(m.getId())
                .userId(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .mssv(u.getMssv())
                .khoa(u.getKhoa())
                .avatarUrl(u.getAvatarUrl())
                .memberRole(m.getRole().name())
                .joinNote(m.getJoinNote())
                .joinedAt(m.getJoinedAt())
                .totalScore(u.getTotalScore())
                .build();
    }

    private TeamResponse toResponse(Team t, boolean includeMembers) {
        List<TeamMemberResponse> members = includeMembers
                ? memberRepo.findByTeamIdOrderByJoinedAtAsc(t.getId())
                             .stream().map(this::toMemberResponse).collect(Collectors.toList())
                : null;

        UserHumg coach = t.getCoach();
        return TeamResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .subject(t.getSubject())
                .description(t.getDescription())
                .avatarUrl(t.getAvatarUrl())
                .isActive(t.getIsActive())
                .coachId(coach != null ? coach.getId() : null)
                .coachName(coach != null ? coach.getFullName() : null)
                .coachEmail(coach != null ? coach.getEmail() : null)
                .memberCount(memberRepo.findByTeamIdOrderByJoinedAtAsc(t.getId()).size())
                .members(members)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    // ── Public: Danh sách đội tuyển ─────────────────────────────────────────
    public List<TeamResponse> getActiveTeams() {
        return teamRepo.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream().map(t -> toResponse(t, false)).collect(Collectors.toList());
    }

    // ── Public: Chi tiết đội tuyển ──────────────────────────────────────────
    public TeamResponse getTeamDetail(Long id) {
        Team t = teamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển #" + id));
        return toResponse(t, true);
    }

    // ── Admin: Tất cả đội tuyển ─────────────────────────────────────────────
    public List<TeamResponse> getAllTeams(String q) {
        List<Team> teams = (q != null && !q.isBlank())
                ? teamRepo.search(q.trim())
                : teamRepo.findAllByOrderByCreatedAtDesc();
        return teams.stream().map(t -> toResponse(t, false)).collect(Collectors.toList());
    }

    // ── Admin: Tạo đội tuyển ────────────────────────────────────────────────
    @Transactional
    public TeamResponse createTeam(CreateTeamRequest req) {
        UserHumg coach = req.getCoachId() != null
                ? userRepo.findById(req.getCoachId()).orElse(null)
                : null;

        Team team = Team.builder()
                .name(req.getName())
                .subject(req.getSubject())
                .description(req.getDescription())
                .avatarUrl(req.getAvatarUrl())
                .coach(coach)
                .isActive(true)
                .build();

        return toResponse(teamRepo.save(team), true);
    }

    // ── Admin: Cập nhật đội tuyển ───────────────────────────────────────────
    @Transactional
    public TeamResponse updateTeam(Long id, UpdateTeamRequest req) {
        Team team = teamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển #" + id));

        if (req.getName()        != null) team.setName(req.getName());
        if (req.getSubject()     != null) team.setSubject(req.getSubject());
        if (req.getDescription() != null) team.setDescription(req.getDescription());
        if (req.getAvatarUrl()   != null) team.setAvatarUrl(req.getAvatarUrl());
        if (req.getIsActive()    != null) team.setIsActive(req.getIsActive());
        if (req.getCoachId()     != null) {
            UserHumg coach = userRepo.findById(req.getCoachId()).orElse(null);
            team.setCoach(coach);
        }

        return toResponse(teamRepo.save(team), true);
    }

    // ── Admin: Xóa đội tuyển ────────────────────────────────────────────────
    @Transactional
    public void deleteTeam(Long id) {
        if (!teamRepo.existsById(id))
            throw new RuntimeException("Không tìm thấy đội tuyển #" + id);
        teamRepo.deleteById(id);
    }

    // ── Admin: Toggle active ────────────────────────────────────────────────
    @Transactional
    public TeamResponse toggleActive(Long id) {
        Team team = teamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển #" + id));
        team.setIsActive(!team.getIsActive());
        return toResponse(teamRepo.save(team), false);
    }

    // ── Admin: Thêm thành viên ──────────────────────────────────────────────
    @Transactional
    public TeamMemberResponse addMember(Long teamId, AddTeamMemberRequest req) {
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội tuyển #" + teamId));
        UserHumg user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng #" + req.getUserId()));

        if (memberRepo.existsByTeamIdAndUserId(teamId, req.getUserId()))
            throw new RuntimeException("Người dùng đã là thành viên của đội tuyển này.");

        TeamMember member = TeamMember.builder()
            .team(team)
            .user(user)
            .role(req.getRole() != null ? TeamRole.valueOf(req.getRole().toUpperCase()) : TeamRole.MEMBER)
            .joinNote(req.getJoinNote())
            .build();

        return toMemberResponse(memberRepo.save(member));
    }

    // ── Admin: Xóa thành viên ───────────────────────────────────────────────
    @Transactional
    public void removeMember(Long teamId, Long userId) {
        if (!memberRepo.existsByTeamIdAndUserId(teamId, userId))
            throw new RuntimeException("Thành viên không tồn tại trong đội tuyển.");
        memberRepo.deleteByTeamIdAndUserId(teamId, userId);
    }

    // ── Admin: Đổi vai trò thành viên ──────────────────────────────────────
    @Transactional
    public TeamMemberResponse updateMemberRole(Long teamId, Long userId, String role) {
        TeamMember member = memberRepo.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại."));
                
        // Ép kiểu chuỗi truyền vào thành Enum
        member.setRole(TeamRole.valueOf(role.toUpperCase())); 
        
        return toMemberResponse(memberRepo.save(member));
    }
}