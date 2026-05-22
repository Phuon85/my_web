package com.humg.olympic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Vui lòng nhập email hoặc MSSV")
    private String credential;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}
