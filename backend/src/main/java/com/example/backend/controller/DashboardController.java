package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.entity.UserActivity;
import com.example.backend.service.UserActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {
    
    private final UserActivityService userActivityService;
    
    public DashboardController(UserActivityService userActivityService) {
        this.userActivityService = userActivityService;
    }
    
    @GetMapping("/user-stats")
    public ResponseEntity<?> getUserDashboardStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Log activity
        userActivityService.logActivity(user, "DASHBOARD_VIEW", "User viewed their dashboard");
        
        // Get recent activities
        List<UserActivity> recentActivities = userActivityService.getRecentUserActivities(user.getId());
        
        // In a real application, you would fetch more stats from various services
        Map<String, Object> stats = new HashMap<>();
        stats.put("recentActivities", recentActivities);
        stats.put("totalActivities", recentActivities.size());
        stats.put("lastLogin", "2023-11-15T10:30:00"); // This would be fetched from a real service
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/admin-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminDashboardStats(Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        
        // Log activity
        userActivityService.logActivity(admin, "ADMIN_ACTION", "Admin viewed dashboard statistics");
        
        // In a real application, you would fetch these stats from various services
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", 120);
        stats.put("activeUsers", 85);
        stats.put("newUsers", 12);
        stats.put("userGrowth", new int[]{40, 45, 55, 60, 75, 85, 100, 120});
        
        return ResponseEntity.ok(stats);
    }
}
