package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.entity.UserActivity;
import com.example.backend.repository.UserActivityRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserActivityService {
    
    private final UserActivityRepository userActivityRepository;
    private final HttpServletRequest request;
    
    public UserActivityService(UserActivityRepository userActivityRepository, HttpServletRequest request) {
        this.userActivityRepository = userActivityRepository;
        this.request = request;
    }
    
    public void logActivity(User user, String activityType, String description) {
        UserActivity activity = new UserActivity(user, activityType, description);
        
        // Capture IP address and user agent
        activity.setIpAddress(getClientIp());
        activity.setUserAgent(request.getHeader("User-Agent"));
        
        userActivityRepository.save(activity);
    }
    
    public Page<UserActivity> getUserActivities(Long userId, Pageable pageable) {
        return userActivityRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }
    
    public List<UserActivity> getRecentUserActivities(Long userId) {
        return userActivityRepository.findTop10ByUserIdOrderByTimestampDesc(userId);
    }
    
    public List<UserActivity> getUserActivitiesByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return userActivityRepository.findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, start, end);
    }
    
    private String getClientIp() {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
