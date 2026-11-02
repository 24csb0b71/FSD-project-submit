package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.entity.ElectionConfig;
import com.example.service.ElectionSchedulerService;

@RestController
@RequestMapping("/api/election")
@CrossOrigin(origins = "http://localhost:5173")
public class ElectionConfigController {

    @Autowired
    private ElectionSchedulerService schedulerService;

    @GetMapping("/config")
    public ResponseEntity<ElectionConfig> getSchedule() {
        ElectionConfig config = schedulerService.getSchedule();
        if (config == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(config);
    }

    @PostMapping("/config")
    public ResponseEntity<ElectionConfig> saveSchedule(@RequestBody ElectionConfig config) {
        ElectionConfig saved = schedulerService.saveSchedule(config);
        return ResponseEntity.ok(saved);
    }
}
