package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.ScheduledFuture;
import com.example.entity.ElectionConfig;
import com.example.repo.ElectionConfigRepository;

@Service
public class ElectionSchedulerService {

    @Autowired
    private ElectionConfigRepository electionConfigRepository;

    @Autowired
    private ThreadPoolTaskScheduler taskScheduler;

    private ScheduledFuture<?> startJobFuture;
    private ScheduledFuture<?> endJobFuture;

    public ElectionConfig getSchedule() {
        List<ElectionConfig> list = electionConfigRepository.findAll();
        if (list.isEmpty()) {
            return null;
        }
        return list.get(0);
    }

    public ElectionConfig saveSchedule(ElectionConfig newConfig) {
        ElectionConfig current = getSchedule();
        if (current == null) {
            current = new ElectionConfig();
        }
        current.setStartTime(newConfig.getStartTime());
        current.setEndTime(newConfig.getEndTime());
        
        // Initial state logic based on current time
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(newConfig.getStartTime())) {
            current.setStatus("NOT_STARTED");
        } else if (now.isAfter(newConfig.getEndTime())) {
            current.setStatus("CLOSED");
        } else {
            current.setStatus("ACTIVE");
        }

        ElectionConfig saved = electionConfigRepository.save(current);
        scheduleJobs(saved);
        return saved;
    }

    public void scheduleJobs(ElectionConfig config) {
        // Cancel existing futures
        if (startJobFuture != null) {
            startJobFuture.cancel(false);
        }
        if (endJobFuture != null) {
            endJobFuture.cancel(false);
        }

        LocalDateTime now = LocalDateTime.now();

        // 1. Schedule Start Job if in the future
        if (config.getStartTime().isAfter(now)) {
            startJobFuture = taskScheduler.schedule(() -> {
                updateStatus("ACTIVE");
                System.out.println("Election started automatically: Status set to ACTIVE");
            }, config.getStartTime().atZone(ZoneId.systemDefault()).toInstant());
        }

        // 2. Schedule End Job if in the future
        if (config.getEndTime().isAfter(now)) {
            endJobFuture = taskScheduler.schedule(() -> {
                updateStatus("CLOSED");
                System.out.println("Election ended automatically: Status set to CLOSED");
            }, config.getEndTime().atZone(ZoneId.systemDefault()).toInstant());
        }
    }

    private void updateStatus(String status) {
        ElectionConfig config = getSchedule();
        if (config != null) {
            config.setStatus(status);
            electionConfigRepository.save(config);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void recoverSchedule() {
        ElectionConfig config = getSchedule();
        if (config != null) {
            LocalDateTime now = LocalDateTime.now();
            
            // Adjust status in case server was offline when transition happened
            if (now.isAfter(config.getEndTime())) {
                updateStatus("CLOSED");
            } else if (now.isAfter(config.getStartTime()) && now.isBefore(config.getEndTime())) {
                updateStatus("ACTIVE");
            }
            
            // Re-schedule future transitions
            scheduleJobs(config);
            System.out.println("Election scheduler recovered schedule successfully upon startup.");
        }
    }
}
