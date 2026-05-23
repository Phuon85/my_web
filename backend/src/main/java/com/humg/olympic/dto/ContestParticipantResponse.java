package com.humg.olympic.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ContestParticipantResponse {
    private Long   id;
    private Long   userId;
    private String fullName;
    private String email;
    private String mssv;
    private String khoa;
    private Double score;
    private Integer rankPos;
    private LocalDateTime registeredAt;
}