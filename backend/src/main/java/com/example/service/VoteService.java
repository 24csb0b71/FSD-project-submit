package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.entity.Vote;
import com.example.entity.ElectionConfig;
import com.example.repo.VoteRepository;

@Service
public class VoteService {
    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private ElectionSchedulerService electionSchedulerService;

    public List<Vote> getAllUsers() {
        return voteRepository.findAll(); 
    } 

    public String saveVote(Vote vote) {
        ElectionConfig config = electionSchedulerService.getSchedule();
        if (config == null || !"ACTIVE".equals(config.getStatus())) {
            return "Voting is not currently active!";
        }
        if (voteRepository.existsByVoterAndPosition(vote.getVoter_id(), vote.getPosition_id())) {
            return "Already voted for this position!";
        }
        voteRepository.save(vote);
        return "Vote cast successfully!";
    }

}