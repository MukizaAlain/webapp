package com.example.backend.config;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(RoleRepository roleRepository, 
                                  UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {
        return args -> {
            // Initialize roles if they don't exist
            if (roleRepository.count() == 0) {
                roleRepository.save(new Role(Role.ERole.ROLE_USER));
                roleRepository.save(new Role(Role.ERole.ROLE_MODERATOR));
                roleRepository.save(new Role(Role.ERole.ROLE_ADMIN));
            }

            // Create admin user if it doesn't exist
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("alain@example.com");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setFirstName("Alain");
                admin.setLastName("mkz");
                admin.setEnabled(true);
                admin.setEmailVerified(true); // Admin is pre-verified
                
                Set<Role> roles = new HashSet<>();
                roleRepository.findByName(Role.ERole.ROLE_ADMIN).ifPresent(roles::add);
                admin.setRoles(roles);
                
                userRepository.save(admin);
            }
        };
    }
}
