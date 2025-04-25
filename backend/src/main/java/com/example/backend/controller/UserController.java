package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserActivityService;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserActivityService userActivityService;

    public UserController(UserRepository userRepository, UserService userService, UserActivityService userActivityService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.userActivityService = userActivityService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        
        // Log activity
        userActivityService.logActivity(user, "PROFILE_VIEW", "User viewed their profile");
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("roles", user.getRoles());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User admin = (User) authentication.getPrincipal();
        
        // Log activity
        userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin viewed all users");
        
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #id")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        // Log activity
        if (currentUser.getId().equals(id)) {
            userActivityService.logActivity(currentUser, "PROFILE_VIEW", "User viewed their profile details");
        } else {
            userActivityService.logActivity(currentUser, "ADMIN_ACTION", "Admin viewed user with ID: " + id);
        }
        
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody Map<String, String> updates, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        try {
            User updatedUser = userService.updateUser(user.getId(), updates);
            
            // Log activity
            userActivityService.logActivity(user, "PROFILE_UPDATE", "User updated their profile");
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedUser.getId());
            response.put("username", updatedUser.getUsername());
            response.put("email", updatedUser.getEmail());
            response.put("firstName", updatedUser.getFirstName());
            response.put("lastName", updatedUser.getLastName());
            response.put("message", "Profile updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> updates, Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        
        try {
            User updatedUser = userService.updateUser(id, updates);
            
            // Log activity
            userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin updated user with ID: " + id);
            
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        
        if (admin.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("message", "You cannot delete your own account"));
        }
        
        try {
            userService.deleteUser(id);
            
            // Log activity
            userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin deleted user with ID: " + id);
            
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        
        try {
            userService.changePassword(user.getId(), currentPassword, newPassword);
            
            // Log activity
            userActivityService.logActivity(user, "PASSWORD_CHANGE", "User changed their password");
            
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
