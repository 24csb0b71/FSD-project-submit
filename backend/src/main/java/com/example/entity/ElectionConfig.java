package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "election_config")
public class ElectionConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "status")
    private String status = "NOT_STARTED"; // NOT_STARTED, ACTIVE, CLOSED

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @JsonProperty("start_time")
    public LocalDateTime getStartTime() {
        return startTime;
    }

    @JsonProperty("start_time")
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    @JsonProperty("end_time")
    public LocalDateTime getEndTime() {
        return endTime;
    }

    @JsonProperty("end_time")
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
