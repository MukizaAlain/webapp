package com.example.backend.security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TwoFactorResponse {
    private Long userId;
    private String username;
    private boolean requiresTwoFactor = true;
}
