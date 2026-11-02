package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.entity.Student;
import com.example.repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<Student> getAllUsers() {
        return userRepository.findAll(); 
    } 
    
    public Student getUserByStudentId(String studentId) {
        if (studentId == null) {
            return null;
        }
        return userRepository.findByStudentId(studentId.toUpperCase());
    }

    public boolean isValidLogin(String student_id, String password) {
        if (student_id == null || password == null) {
            return false;
        }
        Student S = getUserByStudentId(student_id);

        if (S == null) return false;

        return passwordEncoder.matches(password,S.getPassword());
    }

    public Student saveStudent(Student student) {
        if (student != null) {
            if (student.getStudentId() != null) {
                student.setStudentId(student.getStudentId().toUpperCase());
            }
            if (student.getEmailId() != null) {
                student.setEmailId(student.getEmailId().toLowerCase());
            }
        }
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        return userRepository.save(student);
    }

    public boolean isValidPassword(String password) {
        if (password == null || password.length() < 10) {
            return false;
        }
        boolean hasNumber = false;
        boolean hasSpecial = false;
        for (int i = 0; i < password.length(); i++) {
            char c = password.charAt(i);
            if (Character.isDigit(c)) {
                hasNumber = true;
            } else if (c == '!' || c == '@' || c == '$' || c == '&' || c == '*') {
                hasSpecial = true;
            }
        }
        return hasNumber && hasSpecial;
    }

    public boolean isValidRollNo(String rollNo) {
        if (rollNo == null) {
            return false;
        }
        return rollNo.matches("^[0-9]{2}[A-Za-z]{2}[A-Za-z]0[ABab][0-9]{2}$");
    }

    public boolean isValidEmail(String email, String rollNo) {
        if (email == null || rollNo == null) {
            return false;
        }
        String emailLower = email.toLowerCase();
        String rollNoLower = rollNo.toLowerCase();
        return emailLower.contains(rollNoLower) && emailLower.contains("nitw.ac.in");
    }

    public String getName(String studentId){
        Student p = userRepository.findByStudentId(studentId);

        if (p == null) {
            return null;
        }

        return p.getsName();
    }

}