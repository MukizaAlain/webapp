package com.example.backend.repository;

import com.example.backend.entity.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    
    Page<UserActivity> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    
    List<UserActivity> findTop10ByUserIdOrderByTimestampDesc(Long userId);
    
    List<UserActivity> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
            Long userId, LocalDateTime start, LocalDateTime end);
    
    Page<UserActivity> findByActivityTypeOrderByTimestampDesc(String activityType, Pageable pageable);
}
