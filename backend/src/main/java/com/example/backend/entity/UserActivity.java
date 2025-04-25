package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@Table(name = "user_activities")
public class UserActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String activityType;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(length = 50)
    private String ipAddress;
    
    @Column
    private String userAgent;
    
    public UserActivity(User user, String activityType, String description) {
        this.user = user;
        this.activityType = activityType;
        this.description = description;
        this.timestamp = LocalDateTime.now();
    }
}
