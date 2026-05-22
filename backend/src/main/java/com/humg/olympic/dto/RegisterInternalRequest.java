package com.humg.olympic.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterInternalRequest {

    @NotBlank(message = "Vui lòng nhập họ và tên")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Email không hợp lệ")
    @Pattern(regexp = ".*@student\\.humg\\.edu\\.vn$",
             message = "Email phải có đuôi @student.humg.edu.vn")
    private String email;

    @NotBlank(message = "Vui lòng nhập lớp")
    private String lop;

    @NotBlank(message = "Vui lòng chọn khoa")
    private String khoa;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    @Size(min = 8, message = "Mật khẩu phải ít nhất 8 ký tự")
    private String password;
}
