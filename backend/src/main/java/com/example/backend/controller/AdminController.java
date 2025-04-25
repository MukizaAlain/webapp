package com.example.backend.controller;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.MessageResponse;
import com.example.backend.service.EmailService;
import com.example.backend.service.UserActivityService;
import com.example.backend.service.UserService;
import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserService userService;
    private final UserActivityService userActivityService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AdminController(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserService userService,
            UserActivityService userActivityService,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userService = userService;
        this.userActivityService = userActivityService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin viewed all users");
        
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id, Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        
        return userRepository.findById(id)
                .map(user -> {
                    userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin viewed user details for user ID: " + id);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData, Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        
        try {
            // Extract user data
            String username = (String) userData.get("username");
            String email = (String) userData.get("email");
            String password = (String) userData.get("password");
            String firstName = (String) userData.get("firstName");
            String lastName = (String) userData.get("lastName");
            List<String> roleNames = (List<String>) userData.get("roles");
            
            // Validate required fields
            if (username == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username, email, and password are required"));
            }
            
            // Check if username or email already exists
            if (userRepository.existsByUsername(username)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username is already taken"));
            }
            
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email is already in use"));
            }
            
            // Create new user
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(password));
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setEnabled(true);
            newUser.setEmailVerified(true); // Admin-created users are pre-verified
            
            // Set roles
            Set<Role> roles = new HashSet<>();
            if (roleNames == null || roleNames.isEmpty()) {
                // Default to USER role if none specified
                roleRepository.findByName(Role.ERole.ROLE_USER)
                        .ifPresent(roles::add);
            } else {
                roleNames.forEach(roleName -> {
                    switch (roleName) {
                        case "ROLE_ADMIN":
                            roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                                    .ifPresent(roles::add);
                            break;
                        case "ROLE_MODERATOR":
                            roleRepository.findByName(Role.ERole.ROLE_MODERATOR)
                                    .ifPresent(roles::add);
                            break;
                        default:
                            roleRepository.findByName(Role.ERole.ROLE_USER)
                                    .ifPresent(roles::add);
                            break;
                    }
                });
            }
            
            newUser.setRoles(roles);
            User savedUser = userRepository.save(newUser);
            
            // Log activity
            userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin created new user: " + username);
            
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error creating user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates, Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        
        // Prevent admin from updating their own account through this endpoint
        if (admin.getId().equals(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Admins should update their own account through the user profile endpoint"));
        }
        
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();
        
        try {
            // Update basic fields if provided
            if (updates.containsKey("firstName")) {
                user.setFirstName((String) updates.get("firstName"));
            }
            
            if (updates.containsKey("lastName")) {
                user.setLastName((String) updates.get("lastName"));
            }
            
            if (updates.containsKey("email")) {
                String newEmail = (String) updates.get("email");
                if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Email is already in use"));
                }
                user.setEmail(newEmail);
            }
            
            // Update password if provided
            if (updates.containsKey("password")) {
                String newPassword = (String) updates.get("password");
                if (newPassword != null && !newPassword.isEmpty()) {
                    user.setPassword(passwordEncoder.encode(newPassword));
                }
            }
            
            // Update roles if provided
            if (updates.containsKey("roles")) {
                List<String> roleNames = (List<String>) updates.get("roles");
                if (roleNames != null && !roleNames.isEmpty()) {
                    Set<Role> roles = new HashSet<>();
                    roleNames.forEach(roleName -> {
                        switch (roleName) {
                            case "ROLE_ADMIN":
                                roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                                        .ifPresent(roles::add);
                                break;
                            case "ROLE_MODERATOR":
                                roleRepository.findByName(Role.ERole.ROLE_MODERATOR)
                                        .ifPresent(roles::add);
                                break;
                            default:
                                roleRepository.findByName(Role.ERole.ROLE_USER)
                                        .ifPresent(roles::add);
                                break;
                        }
                    });
                    user.setRoles(roles);
                }
            }
            
            // Update enabled status if provided
            if (updates.containsKey("enabled")) {
                Boolean enabled = (Boolean) updates.get("enabled");
                if (enabled != null) {
                    user.setEnabled(enabled);
                }
            }
            
            // Update emailVerified status if provided
            if (updates.containsKey("emailVerified")) {
                Boolean emailVerified = (Boolean) updates.get("emailVerified");
                if (emailVerified != null) {
                    user.setEmailVerified(emailVerified);
                }
            }
            
            User updatedUser = userRepository.save(user);
            
            // Log activity
            userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin updated user: " + user.getUsername());
            
            // Send notification email to user
            try {
                emailService.sendAccountUpdateEmail(user.getEmail(), user.getUsername());
            } catch (MessagingException e) {
                // Don't fail the update if email sending fails
                System.err.println("Failed to send account update email: " + e.getMessage());
            }
            
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error updating user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        
        // Prevent admin from deleting their own account
        if (admin.getId().equals(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Admins cannot delete their own account through this endpoint"));
        }
        
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();
        String userEmail = user.getEmail();
        String username = user.getUsername();
        
        try {
            // Send deletion notification before deleting the user
            try {
                emailService.sendAccountDeletionEmail(userEmail, username);
            } catch (MessagingException e) {
                // Don't fail the deletion if email sending fails
                System.err.println("Failed to send account deletion email: " + e.getMessage());
            }
            
            // Log activity before deleting the user
            userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin deleted user: " + username);
            
            // Delete the user
            userRepository.deleteById(id);
            
            return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error deleting user: " + e.getMessage()));
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats(Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin viewed system statistics");
        
        Map<String, Object> stats = new HashMap<>();
        
        // Get total user count
        long totalUsers = userRepository.count();
        stats.put("totalUsers", totalUsers);
        
        // Get active users (enabled accounts)
        long activeUsers = userRepository.findAll().stream()
                .filter(User::isEnabled)
                .count();
        stats.put("activeUsers", activeUsers);
        
        // Get verified users
        long verifiedUsers = userRepository.findAll().stream()
                .filter(User::isEmailVerified)
                .count();
        stats.put("verifiedUsers", verifiedUsers);
        
        // Get users by role
        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("admin", userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == Role.ERole.ROLE_ADMIN))
                .count());
        usersByRole.put("moderator", userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == Role.ERole.ROLE_MODERATOR))
                .count());
        usersByRole.put("user", userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName() == Role.ERole.ROLE_USER))
                .count());
        stats.put("usersByRole", usersByRole);
        
        return ResponseEntity.ok(stats);
    }
}
