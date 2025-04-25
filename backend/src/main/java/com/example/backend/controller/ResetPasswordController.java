package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.MessageResponse;
import com.example.backend.security.ResetPasswordRequest;
import com.example.backend.service.EmailService;
import com.example.backend.service.UserActivityService;
import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/reset-password")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResetPasswordController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UserActivityService userActivityService;

    public ResetPasswordController(
            UserRepository userRepository, 
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            UserActivityService userActivityService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.userActivityService = userActivityService;
    }

    @PostMapping
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest resetPasswordRequest) {
        Optional<User> userOptional = userRepository.findByResetPasswordToken(resetPasswordRequest.getToken());
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid reset token."));
        }
        
        User user = userOptional.get();
        
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Reset token has expired."));
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
        
        // Log the password reset activity
        userActivityService.logActivity(user, "PASSWORD_RESET", "User reset their password via email");
        
        // Send confirmation email
        try {
            emailService.sendPasswordResetConfirmationEmail(user.getEmail());
        } catch (MessagingException e) {
            // We don't want to fail the password reset if the confirmation email fails
            // Just log the error
            System.err.println("Failed to send password reset confirmation email: " + e.getMessage());
        }
        
        return ResponseEntity.ok(new MessageResponse("Password reset successfully! You can now log in with your new password."));
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        Optional<User> userOptional = userRepository.findByResetPasswordToken(token);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid reset token."));
        }
        
        User user = userOptional.get();
        
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Reset token has expired."));
        }
        
        return ResponseEntity.ok(new MessageResponse("Valid reset token."));
    }
}
