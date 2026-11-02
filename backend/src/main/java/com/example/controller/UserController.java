package com.example.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.example.service.OtpService;
import com.example.entity.Student;
import com.example.service.UserService;
import com.example.utils.JwtUtil;
import com.example.utils.SecurityConfig;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    @GetMapping("/all")
    public List<Student> getAll() {
        return userService.getAllUsers();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {

        String studentId = credentials.get("studentId");
        if (studentId == null) {
            studentId = credentials.get("student_id");
        }
        String password = credentials.get("password");

        if (studentId == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Student ID or password.");
        }

        boolean isValid = userService.isValidLogin(studentId, password);
        if (isValid) {
            Student student = userService.getUserByStudentId(studentId);
            boolean isAdmin = student != null && student.getIs_admin() != null && student.getIs_admin();
            
            String token = jwtUtil.generateToken(studentId, isAdmin); 
            return ResponseEntity.ok(Map.of(
                "message", "Login successful!",
                "token",token,
                "is_admin", isAdmin
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Student ID or password.");
        }
    }

    @GetMapping("/{studentId}/is-admin")
    public ResponseEntity<Boolean> isAdmin(@PathVariable String studentId) {
        Student student = userService.getUserByStudentId(studentId);
        boolean isAdmin = student != null && student.getIs_admin() != null && student.getIs_admin();
        return ResponseEntity.ok(isAdmin);
    }

    @PostMapping("/check_register")
    public ResponseEntity<?> check_register(@RequestBody Map<String, String> credentials) {
        String password1 = credentials.get("pass_id");
        String password2 = credentials.get("pass_id2");
        String email_id = credentials.get("email");
        String rollno = credentials.get("rollno");

        if (password1 == null || password2 == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing password fields.");
        }

        if (!password1.equals(password2)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Passwords dont match");
        }

        if (!userService.isValidRollNo(rollno)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Roll Number format.");
        }

        if (!userService.isValidEmail(email_id, rollno)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email must contain the roll number and 'nitw.ac.in'.");
        }

        return ResponseEntity.ok(Map.of("message", "Validation successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Student student) {
        if (student.getStudentId() == null || student.getStudentId().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Student ID.");
        }

        if (userService.getUserByStudentId(student.getStudentId()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Student ID already registered.");
        }

        if (!userService.isValidRollNo(student.getStudentId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Roll Number format.");
        }

        if (!userService.isValidEmail(student.getEmailId(), student.getStudentId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email must contain the roll number and 'nitw.ac.in'.");
        }

        if (!userService.isValidPassword(student.getPassword())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Password must contain a number and a special character, and be at least 10 characters long.");
        }

        Student savedStudent = userService.saveStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);
    }

    @GetMapping("/{studentId}/name")
    public String getName(@PathVariable String studentId) {
        return userService.getName(studentId);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String studentId = body.get("student_id");
        String email = body.get("email_id");
        otpService.generateAndSendOtp(studentId, email);
        return ResponseEntity.ok("OTP sent.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String studentId = body.get("student_id");
        String otp = body.get("otp");
        boolean valid = otpService.verifyOtp(studentId, otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired OTP.");
        }
        return ResponseEntity.ok("OTP verified.");
    }


}