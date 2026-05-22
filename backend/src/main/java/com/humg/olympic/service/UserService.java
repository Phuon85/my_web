package com.humg.olympic.service;

import com.humg.olympic.dto.*;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserInfoResponse> getLeaderboard(int limit) {
        return userRepository.findLeaderboard(PageRequest.of(0, limit))
                .stream()
                .map(AuthService::toInfo)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserInfoResponse updateMe(UpdateProfileRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (req.getFullName() != null && !req.getFullName().isBlank())
            user.setFullName(req.getFullName());
        if (req.getLop() != null)       user.setLop(req.getLop());
        if (req.getKhoa() != null)      user.setKhoa(req.getKhoa());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());

        userRepository.save(user);
        return AuthService.toInfo(user);
    }

    public List<UserInfoResponse> getAll(String search, String role) {
        return userRepository.searchUsers(search, role)
                .stream()
                .map(AuthService::toInfo)
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleActive(Long id) {
        UserHumg user = userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Không tìm thấy người dùng id=" + id));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        return user.getIsActive();
    }

    @Transactional
    public void changeRole(Long id, String role) {
        List<String> valid = List.of("STUDENT","TEACHER","MANAGER","ADMIN");
        if (!valid.contains(role))
            throw new IllegalArgumentException("Vai trò không hợp lệ: " + role);

        UserHumg user = userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Không tìm thấy người dùng id=" + id));
        user.setRole(role);
        userRepository.save(user);
    }
}
