package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.example.entity.Candidate;
import com.example.repo.CandidateRepository;

@Service
public class CandidateService {
    @Autowired
    private CandidateRepository candidateRepository;

    public List<Candidate> getAllUsers() {
        return candidateRepository.findAll(); 
    } 

    public void addCandidate(Candidate candidate) {
        if (candidate.getApproved() == null || candidate.getApproved().isEmpty()) {
            candidate.setApproved("PENDING");
        }
        candidateRepository.save(candidate);
    }

    public List<Candidate> getAllApprovedCandidates() {
        return candidateRepository.findByApprovedIgnoreCase("APPROVED");
    }

    public List<Candidate> getAllPendingCandidates() {
        return candidateRepository.findByApprovedIgnoreCase("PENDING");
    }

    public boolean approveCandidate(int candidateId) {
        Optional<Candidate> optionalCandidate = candidateRepository.findById(candidateId);
        if (optionalCandidate.isPresent()) {
            Candidate c = optionalCandidate.get();
            c.setApproved("APPROVED");
            candidateRepository.save(c);
            return true;
        }
        return false;
    }

    public boolean disapproveCandidate(int candidateId) {
        Optional<Candidate> optionalCandidate = candidateRepository.findById(candidateId);
        if (optionalCandidate.isPresent()) {
            Candidate c = optionalCandidate.get();
            c.setApproved("DISAPPROVED");
            candidateRepository.save(c);
            return true;
        }
        return false;
    }
}
