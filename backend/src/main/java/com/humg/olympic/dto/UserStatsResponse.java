package com.humg.olympic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {
    private long total;
    private long active;
    private long locked;
    private long admin;
    private long teacher;
    private long student;
    private long internal;   // sinh viên HUMG
    private long external;   // sinh viên ngoài
}
