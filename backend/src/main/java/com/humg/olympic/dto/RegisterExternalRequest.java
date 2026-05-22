package com.humg.olympic.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterExternalRequest {

    @NotBlank(message = "Vui lòng chọn trường")
    private String truong;

    @NotBlank(message = "Vui lòng nhập họ và tên")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    @Size(min = 8, message = "Mật khẩu phải ít nhất 8 ký tự")
    private String password;
}
