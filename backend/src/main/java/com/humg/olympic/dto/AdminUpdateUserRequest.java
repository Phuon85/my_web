package com.humg.olympic.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {

    @Size(min = 2, max = 100)
    private String fullName;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String mssv;
    private String lop;
    private String khoa;
    private String truong;
    private String avatarUrl;

    @Pattern(regexp = "STUDENT|TEACHER|MANAGER|ADMIN",
             message = "Vai trò không hợp lệ")
    private String role;
}
