package com.humg.olympic.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdminCreateUserRequest {

    @NotBlank(message = "Vui lòng nhập họ và tên")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    @Size(min = 6, message = "Mật khẩu phải ít nhất 6 ký tự")
    private String password;

    private String mssv;
    private String lop;
    private String khoa;
    private String truong;

    @Pattern(regexp = "STUDENT|TEACHER|MANAGER|ADMIN",
             message = "Vai trò không hợp lệ")
    private String role = "STUDENT";

    private Boolean isInternal = true;
}
