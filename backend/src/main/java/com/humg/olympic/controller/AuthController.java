package com.humg.olympic.controller;

import com.humg.olympic.dto.*;
import com.humg.olympic.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register/internal")
    public ResponseEntity<MessageResponse> registerInternal(
            @Valid @RequestBody RegisterInternalRequest req) {
        authService.registerInternal(req);
        return ResponseEntity.ok(new MessageResponse("Đăng ký thành công!"));
    }

    @PostMapping("/register/external")
    public ResponseEntity<MessageResponse> registerExternal(
            @Valid @RequestBody RegisterExternalRequest req) {
        authService.registerExternal(req);
        return ResponseEntity.ok(new MessageResponse("Đăng ký thành công!"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }
}
