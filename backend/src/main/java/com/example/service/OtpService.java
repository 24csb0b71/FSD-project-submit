package com.example.service;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.time.Instant;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    record OtpEntry(String otp, Instant expiry) {}

    public void generateAndSendOtp(String studentId, String email) {
        String otp = String.valueOf(100000 + new Random().nextInt(900000)); 
        otpStore.put(studentId, new OtpEntry(otp, Instant.now().plusSeconds(300))); 

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your Digivote OTP");
        message.setText("Your OTP is: " + otp + ". It expires in 5 minutes.");
        mailSender.send(message);
    }

    public boolean verifyOtp(String studentId, String submittedOtp) {
        OtpEntry entry = otpStore.get(studentId);
        if (entry == null || Instant.now().isAfter(entry.expiry())) {
            return false;
        }
        boolean match = entry.otp().equals(submittedOtp);
        if (match) otpStore.remove(studentId); // single-use
        return match;
    }
}