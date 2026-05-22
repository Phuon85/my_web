package com.humg.olympic.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private String message;
    private boolean success;

    public MessageResponse(String message) {
        this.message = message;
        this.success = true;
    }
}
