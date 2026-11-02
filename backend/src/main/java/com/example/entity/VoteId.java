package com.example.entity;

import java.io.Serializable;
import java.util.Objects;

public class VoteId implements Serializable {

    private String voter_id;
    private int position_id;

    public VoteId() {}                                    

    public VoteId(String voter_id, int position_id) {   
        this.voter_id = voter_id;
        this.position_id = position_id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VoteId)) return false;        
        VoteId that = (VoteId) o;                       
        return position_id == that.position_id && Objects.equals(voter_id, that.voter_id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(voter_id, position_id);
    }
}