package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.example.entity.Candidate;
import com.example.service.CandidateService;

@RestController
@RequestMapping("/api/candidate")
@CrossOrigin(origins = "http://localhost:5173")

public class CandidateController {
    @Autowired
    private CandidateService candidateService;



    @GetMapping("/all")
    public List<Candidate> getAll() {
        return candidateService.getAllApprovedCandidates();
    }

    @GetMapping("/allpending")
    public List<Candidate> getAllPending() {
        return candidateService.getAllPendingCandidates();
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCandidate(@RequestBody Map<String,String> data) {

        try {
            Candidate c = new Candidate();

            c.setStudentId(data.get("studentId"));
            c.setPositionId(Integer.parseInt(data.get("positionId")));
            c.setManifesto(data.get("manifesto"));
            c.setImg_src(data.get("img_src"));
            candidateService.addCandidate(c);
            return ResponseEntity.ok("Candidate Added");
        }
        catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
        
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveCandidate(@PathVariable int id) {
        boolean success = candidateService.approveCandidate(id);
        if (success) {
            return ResponseEntity.ok("Candidate approved");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found");
        }
    }

    @PostMapping("/{id}/disapprove")
    public ResponseEntity<?> disapproveCandidate(@PathVariable int id) {
        boolean success = candidateService.disapproveCandidate(id);
        if (success) {
            return ResponseEntity.ok("Candidate disapproved");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found");
        }
    }
}