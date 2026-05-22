package com.humg.olympic.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 100)
    private String fullName;

    private String lop;
    private String khoa;
    private String avatarUrl;
}
