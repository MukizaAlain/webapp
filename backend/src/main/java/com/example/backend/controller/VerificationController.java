package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/verify-email")  // Change this to match the frontend URL
public class VerificationController {

    @Autowired
    private UserRepository userRepository;

    public VerificationController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        Optional<User> userOptional = userRepository.findByVerificationToken(token);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid verification token."));
        }
        
        User user = userOptional.get();
        
        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Verification token has expired."));
        }
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("Email verified successfully!"));
    }
    
    @PostMapping("/resend")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            // Don't reveal that the email doesn't exist for security reasons
            return ResponseEntity.ok(new MessageResponse("If your email is registered, you will receive a verification email."));
        }
        
        User user = userOptional.get();
        
        if (user.isEmailVerified()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already verified."));
        }
        
        // Generate new verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusDays(1));
        userRepository.save(user);
        
        // Send verification email
        // This would be handled by the EmailService in a real implementation
        
        return ResponseEntity.ok(new MessageResponse("Verification email sent successfully!"));
    }
}
