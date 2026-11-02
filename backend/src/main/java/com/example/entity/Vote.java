package com.example.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.*;

@Entity
@Table(name = "vote")
@IdClass(VoteId.class) 
public class Vote {

    @Id
    @Column(name = "voter_id")
    private String voter_id;

    @Id
    @Column(name = "position_id")
    private int position_id;

    @Column(name = "candidate_id")
    private int candidate_id;

    public int getCandidate_id() {
        return candidate_id;
    }

    public void setCandidate_id(int candidate_id){
        this.candidate_id = candidate_id;
    }

    public String getVoter_id() {
        return voter_id;
    }

    public void setVoter_id(String voter_id){
        this.voter_id = voter_id;
    }

    public int getPosition_id() {
        return position_id;
    }

    public void setPosition_id(int position_id){
        this.position_id = position_id;
    }
}
