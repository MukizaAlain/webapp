package com.example.backend.service;

import com.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class TwoFactorAuthService {

    @Value("${app.name}")
    private String appName;
    
    private final Map<Long, String> userCodes = new HashMap<>();

    public String generateTwoFactorSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    public String generateQrCodeUrl(String username, String secret) {
        String encodedSecret = Base64.getEncoder().encodeToString(secret.getBytes());
        return "otpauth://totp/" + appName + ":" + username + "?secret=" + encodedSecret + "&issuer=" + appName;
    }

    public String generateTwoFactorCode(User user) {
        // For simplicity, we'll generate a 6-digit code
        // In a real implementation, you would use TOTP (Time-based One-Time Password)
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        String codeStr = String.valueOf(code);
        
        // Store the code for verification
        userCodes.put(user.getId(), codeStr);
        
        return codeStr;
    }

    public boolean verifyTwoFactorCode(User user, String code) {
        // For simplicity, we'll just check if the code matches
        // In a real implementation, you would verify the TOTP code
        String storedCode = userCodes.get(user.getId());
        if (storedCode != null && storedCode.equals(code)) {
            userCodes.remove(user.getId());
            return true;
        }
        return false;
    }
    
    // For TOTP implementation (Time-based One-Time Password)
    private String generateTOTP(String secret, long timeCounter) {
        try {
            byte[] decodedSecret = Base64.getDecoder().decode(secret);
            
            // Convert time counter to byte array
            byte[] data = new byte[8];
            for (int i = 8; i-- > 0; timeCounter >>>= 8) {
                data[i] = (byte) timeCounter;
            }
            
            // Generate HMAC-SHA1 hash
            SecretKeySpec signKey = new SecretKeySpec(decodedSecret, "HmacSHA1");
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(signKey);
            byte[] hash = mac.doFinal(data);
            
            // Extract 4 bytes from the hash based on the offset
            int offset = hash[hash.length - 1] & 0xf;
            int binary = ((hash[offset] & 0x7f) << 24) |
                         ((hash[offset + 1] & 0xff) << 16) |
                         ((hash[offset + 2] & 0xff) << 8) |
                         (hash[offset + 3] & 0xff);
            
            // Generate 6-digit code
            int otp = binary % 1000000;
            return String.format("%06d", otp);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating TOTP", e);
        }
    }
    
    public String generateTOTPCode(String secret) {
        // Get current time in 30-second intervals
        long timeCounter = Instant.now().getEpochSecond() / 30;
        return generateTOTP(secret, timeCounter);
    }
    
    public boolean verifyTOTPCode(String secret, String code) {
        // Get current time in 30-second intervals
        long timeCounter = Instant.now().getEpochSecond() / 30;
        
        // Check current interval and previous interval (to account for clock skew)
        String currentCode = generateTOTP(secret, timeCounter);
        String previousCode = generateTOTP(secret, timeCounter - 1);
        
        return code.equals(currentCode) || code.equals(previousCode);
    }
}
