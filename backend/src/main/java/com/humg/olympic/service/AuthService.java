package com.humg.olympic.service;

import com.humg.olympic.dto.*;
import com.humg.olympic.entity.UserHumg;
import com.humg.olympic.repository.UserRepository;
import com.humg.olympic.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getCredential(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        String token = jwtTokenProvider.generateToken(auth);

        UserHumg user = userRepository.findByEmailOrMssv(req.getCredential())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return new AuthResponse(token, toInfo(user));
    }

    @Transactional
    public void registerInternal(RegisterInternalRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email này đã được đăng ký");

        UserHumg user = UserHumg.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .lop(req.getLop())
                .khoa(req.getKhoa())
                .password(passwordEncoder.encode(req.getPassword()))
                .role("STUDENT")
                .isInternal(true)
                .isActive(true)
                .build();
        userRepository.save(user);
    }

    @Transactional
    public void registerExternal(RegisterExternalRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email này đã được đăng ký");

        UserHumg user = UserHumg.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .truong(req.getTruong())
                .password(passwordEncoder.encode(req.getPassword()))
                .role("STUDENT")
                .isInternal(false)
                .isActive(true)
                .build();
        userRepository.save(user);
    }

    public UserInfoResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserHumg user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return toInfo(user);
    }

    public static UserInfoResponse toInfo(UserHumg u) {
        return UserInfoResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .mssv(u.getMssv())
                .role(u.getRole())
                .avatarUrl(u.getAvatarUrl())
                .lop(u.getLop())
                .khoa(u.getKhoa())
                .truong(u.getTruong())
                .totalScore(u.getTotalScore())
                .rank(u.getRank())
                .isInternal(u.getIsInternal())
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}