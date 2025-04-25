package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.entity.UserActivity;
import com.example.backend.service.UserActivityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserActivityController {
    
    private final UserActivityService userActivityService;
    
    public UserActivityController(UserActivityService userActivityService) {
        this.userActivityService = userActivityService;
    }
    
    @GetMapping("/me")
    public ResponseEntity<List<UserActivity>> getMyRecentActivities(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<UserActivity> activities = userActivityService.getRecentUserActivities(user.getId());
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/me/all")
    public ResponseEntity<Page<UserActivity>> getMyActivities(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        User user = (User) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page, size);
        Page<UserActivity> activities = userActivityService.getUserActivities(user.getId(), pageable);
        return ResponseEntity.ok(activities);
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.id == #userId")
    public ResponseEntity<Page<UserActivity>> getUserActivities(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<UserActivity> activities = userActivityService.getUserActivities(userId, pageable);
        return ResponseEntity.ok(activities);
    }
}
