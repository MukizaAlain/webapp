package com.example.backend.controller;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.*;
import com.example.backend.service.EmailService;
import com.example.backend.service.TwoFactorAuthService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final TwoFactorAuthService twoFactorAuthService;

    public AuthController(AuthenticationManager authenticationManager,
                         UserRepository userRepository,
                         RoleRepository roleRepository,
                         PasswordEncoder passwordEncoder,
                         JwtUtils jwtUtils,
                         EmailService emailService,
                         TwoFactorAuthService twoFactorAuthService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
        this.twoFactorAuthService = twoFactorAuthService;
    }

   
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );
    
        SecurityContextHolder.getContext().setAuthentication(authentication);
        User userDetails = (User) authentication.getPrincipal();
        
        // Check if email is verified
        if (!userDetails.isEmailVerified()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is not verified."));
        }
        
        // Check if 2FA is enabled
        if (userDetails.isTwoFactorEnabled()) {
            // Generate and send 2FA code
            String twoFactorCode = twoFactorAuthService.generateTwoFactorCode(userDetails);
            try {
                emailService.sendTwoFactorAuthenticationEmail(userDetails.getEmail(), twoFactorCode);
                Map<String, Object> response = new HashMap<>();
                response.put("userId", userDetails.getId());
                response.put("username", userDetails.getUsername());
                response.put("requiresTwoFactor", true);
                return ResponseEntity.ok(response);
            } catch (MessagingException e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Failed to send 2FA code."));
            }
        }
        
        // If 2FA is not enabled, generate JWT and return user info
        String jwt = jwtUtils.generateToken(userDetails);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    
        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                userDetails.isEmailVerified(),
                userDetails.isTwoFactorEnabled(),
                false));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactorCode(@Valid @RequestBody TwoFactorRequest twoFactorRequest) {
        Optional<User> userOptional = userRepository.findById(twoFactorRequest.getUserId());
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }
        
        User user = userOptional.get();
        
        if (twoFactorAuthService.verifyTwoFactorCode(user, twoFactorRequest.getCode())) {
            // Generate JWT and return user info
            String jwt = jwtUtils.generateToken(user);
            List<String> roles = user.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles,
                    user.isEmailVerified(),
                    user.isTwoFactorEnabled(),
                    true));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid 2FA code."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEnabled(true);
        user.setEmailVerified(false);
        
        // Generate verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusDays(1));

        Set<String> strRoles = registerRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(Role.ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(Role.ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(Role.ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (MessagingException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("User registered but failed to send verification email."));
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully! Please check your email to verify your account."));
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        Optional<User> userOptional = userRepository.findByEmail(forgotPasswordRequest.getEmail());
        if (userOptional.isEmpty()) {
            // Don't reveal that the email doesn't exist for security reasons
            return ResponseEntity.ok(new MessageResponse("If your email is registered, you will receive a password reset link."));
        }
        
        User user = userOptional.get();
        
        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        // Send password reset email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        } catch (MessagingException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to send password reset email."));
        }
        
        return ResponseEntity.ok(new MessageResponse("If your email is registered, you will receive a password reset link."));
    }
    
    @PostMapping("/enable-2fa")
    public ResponseEntity<?> enableTwoFactorAuth(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Generate 2FA secret
        String secret = twoFactorAuthService.generateTwoFactorSecret();
        user.setTwoFactorSecret(secret);
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        
        // Generate QR code URL
        String qrCodeUrl = twoFactorAuthService.generateQrCodeUrl(user.getUsername(), secret);
        
        return ResponseEntity.ok(new TwoFactorSetupResponse(secret, qrCodeUrl));
    }
    
    @PostMapping("/disable-2fa")
    public ResponseEntity<?> disableTwoFactorAuth(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        user.setTwoFactorSecret(null);
        user.setTwoFactorEnabled(false);
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("Two-factor authentication disabled successfully."));
    }
}
