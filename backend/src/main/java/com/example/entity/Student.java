package com.example.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;

@Entity
@Table(name = "student")
public class Student {
    @Id
    @Column(name = "student_id")
    private String studentId;
    
    @Column(name = "email_id")
    private String emailId;
    
    @Column(name = "s_name")
    private String sName;

    @Column(name = "password")
    private String password;
    
    @Column(name = "is_admin")
    private Boolean is_admin;

    public String getStudentId() {
        return studentId;
    }

    public Boolean getIs_admin() {
        return is_admin;
    }

    public void setIs_admin(Boolean is_admin) {
        this.is_admin = is_admin;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmailId() {
        return emailId;
    }

    public void setEmailId(String emailId) {
        this.emailId = emailId;
    }

    public void setsName(String sName) {
        this.sName = sName;
    }

    public String getsName() {
        return sName;
    }

    // snake_case aliases for JSON compatibility
    public void setStudent_id(String studentId) {
        this.studentId = studentId;
    }

    public String getStudent_id() {
        return this.studentId;
    }

    public void setEmail_id(String emailId) {
        this.emailId = emailId;
    }

    public String getEmail_id() {
        return this.emailId;
    }

    public void setS_name(String sName) {
        this.sName = sName;
    }

    public String getS_name() {
        return this.sName;
    }
}
