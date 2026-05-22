package com.humg.olympic.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private UserInfoResponse user;

    public AuthResponse(String token, UserInfoResponse user) {
        this.token = token;
        this.user = user;
    }
}
