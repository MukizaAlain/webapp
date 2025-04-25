package com.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.url}")
    private String appUrl;
    
    @Value("${app.name}")
    private String appName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Async
    public void sendVerificationEmail(String to, String token) throws MessagingException {
        Context context = new Context();
        context.setVariable("verificationUrl", appUrl + "/verify-email?token=" + token);
        context.setVariable("appName", appName);
        context.setVariable("expiryTime", "24 hours");
        
        String content = templateEngine.process("verification-email", context);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Verify Your Email Address");
        helper.setText(content, true);
        
        mailSender.send(message);
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) throws MessagingException {
        Context context = new Context();
        context.setVariable("resetUrl", frontendUrl + "/reset-password?token=" + token);
        context.setVariable("appName", appName);
        context.setVariable("expiryTime", "1 hour");
        
        String content = templateEngine.process("reset-password-email", context);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Reset Your Password");
        helper.setText(content, true);
        
        mailSender.send(message);
    }
    
    @Async
    public void sendPasswordResetConfirmationEmail(String to) throws MessagingException {
        Context context = new Context();
        context.setVariable("appName", appName);
        context.setVariable("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        context.setVariable("supportEmail", fromEmail);
        
        String content = templateEngine.process("password-reset-confirmation", context);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Your Password Has Been Reset");
        helper.setText(content, true);
        
        mailSender.send(message);
    }

    @Async
    public void sendTwoFactorAuthenticationEmail(String to, String code) throws MessagingException {
        Context context = new Context();
        context.setVariable("code", code);
        context.setVariable("appName", appName);
        context.setVariable("expiryTime", "5 minutes");
        
        String content = templateEngine.process("two-factor-email", context);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Your Two-Factor Authentication Code");
        helper.setText(content, true);
        
        mailSender.send(message);
    }
    
    @Async
    public void sendAccountDeletionEmail(String to, String username) throws MessagingException {
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("appName", appName);
        context.setVariable("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        context.setVariable("supportEmail", fromEmail);
        
        String content = templateEngine.process("account-deletion", context);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Your Account Has Been Deleted");
        helper.setText(content, true);
        
        mailSender.send(message);
    }
    
    @Async
    public void sendAccountUpdateEmail(String to, String username) throws MessagingException {
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("appName", appName);
        context.setVariable("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        context.setVariable("supportEmail", fromEmail);
        
        String content = templateEngine.process("account-update", context);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject("Your Account Information Has Been Updated");
        helper.setText(content, true);
        
        mailSender.send(message);
    }
}
