package com.example.backend.security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TwoFactorSetupResponse {
    private String secret;
    private String qrCodeUrl;
}
