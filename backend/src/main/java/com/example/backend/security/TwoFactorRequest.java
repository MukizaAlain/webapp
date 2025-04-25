package com.example.backend.security;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorRequest {
    private Long userId;
    
    @NotBlank
    private String code;
}
