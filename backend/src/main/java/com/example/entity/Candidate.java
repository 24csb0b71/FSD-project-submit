package com.example.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.*;

@Entity
@Table(name = "candidate")

public class Candidate{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "candidateid")
    private int candidateId;

    @Column(name = "student_id")
    private String student_id;

    @Column(name = "positionid")
    private int positionId;

    @Column(name = "manifesto")
    private String manifesto;

    @Column(name = "img_src")
    private String img_src;

    @Column(name = "approved")
    private String approved;

    public String getApproved() {
        return approved;
    }

    public void setApproved(String approved) {
        this.approved = approved;
    }

    public String getStudentId() {
        return student_id;
    }

    public void setStudentId(String student_id) {
        this.student_id = student_id;
    }

    public String getImg_src() {
        return img_src;
    }

    public void setImg_src(String img_src) {
        this.img_src = img_src;
    }

    public int getCandidateId() {
        return candidateId;
    }

    public void setCandidatetId(int candidateid) {
        this.candidateId = candidateid;
    }

    public int getPositionId() {
        return positionId;
    }

    public void setPositionId(int positionid) {
        this.positionId = positionid;
    }

    public String getManifesto() {
        return manifesto;
    }

    public void setManifesto(String manifesto) {
        this.manifesto = manifesto;
    }
}