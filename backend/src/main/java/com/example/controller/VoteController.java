package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import com.example.entity.Vote;
import com.example.entity.Candidate;
import com.example.entity.Student;
import com.example.entity.Position;
import com.example.entity.ElectionConfig;
import com.example.service.VoteService;
import com.example.service.CandidateService;
import com.example.service.PositionService;
import com.example.service.UserService;
import com.example.service.ElectionSchedulerService;
import com.example.repo.VoteRepository;
import com.example.repo.UserRepository;
import com.example.repo.PositionRepository;

@RestController
@RequestMapping("/api/voting")
@CrossOrigin(origins = "http://localhost:5173")
public class VoteController {
    @Autowired
    private VoteService voteService;

    @Autowired
    private CandidateService candidateService;

    @Autowired
    private PositionService positionService;

    @Autowired
    private UserService userService;

    @Autowired
    private ElectionSchedulerService electionSchedulerService;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PositionRepository positionRepository;

    @GetMapping("/all")
    public List<Vote> getAll() {
        return voteService.getAllUsers();
    }

    @PostMapping("/vote")
    public ResponseEntity<String> vote(@RequestBody Vote credentials){
        String savedVote = voteService.saveVote(credentials);
        if (savedVote.equals("Vote cast successfully!")) {
            return ResponseEntity.ok(savedVote);
        } else {
            return ResponseEntity.status(409).body(savedVote);
        }
    }

    @GetMapping("/results")
    public ResponseEntity<?> getResults(@RequestParam(value = "is_admin", defaultValue = "false") boolean isAdmin) {
        ElectionConfig config = electionSchedulerService.getSchedule();
        if (!isAdmin && (config == null || !"CLOSED".equals(config.getStatus()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Results will be available after voting ends.");
        }

        List<Candidate> candidates = candidateService.getAllApprovedCandidates();
        List<Map<String, Object>> resultsList = new java.util.ArrayList<>();

        for (Candidate c : candidates) {
            long votes = voteRepository.countByCandidateId(c.getCandidateId());
            Student s = userService.getUserByStudentId(c.getStudentId());
            String studentName = s != null ? s.getsName() : "Unknown Student";
            String positionName = positionService.getName(c.getPositionId());

            Map<String, Object> candidateMap = new java.util.HashMap<>();
            candidateMap.put("candidateId", c.getCandidateId());
            candidateMap.put("studentId", c.getStudentId());
            candidateMap.put("sname", studentName);
            candidateMap.put("positionId", c.getPositionId());
            candidateMap.put("positionName", positionName);
            candidateMap.put("manifesto", c.getManifesto());
            candidateMap.put("imgSrc", c.getImg_src());
            candidateMap.put("voteCount", votes);

            resultsList.add(candidateMap);
        }

        return ResponseEntity.ok(resultsList);
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        Map<String, Object> data = new HashMap<>();

        long totalStudents = userRepository.count();
        long totalVoters = voteRepository.countDistinctVoters();
        long totalVotesCast = voteRepository.count();
        double turnout = totalStudents > 0 ? ((double) totalVoters / totalStudents) * 100.0 : 0.0;

        ElectionConfig config = electionSchedulerService.getSchedule();
        String status = config != null ? config.getStatus() : "NOT_SCHEDULED";

        data.put("totalStudents", totalStudents);
        data.put("totalVoters", totalVoters);
        data.put("totalVotesCast", totalVotesCast);
        data.put("turnoutPercentage", Math.round(turnout * 10.0) / 10.0);
        data.put("electionStatus", status);
        data.put("startTime", config != null ? config.getStartTime() : null);
        data.put("endTime", config != null ? config.getEndTime() : null);

        // Position breakdown
        List<Position> positions = positionRepository.findAll();
        List<Map<String, Object>> posList = new ArrayList<>();
        List<Candidate> approvedCandidates = candidateService.getAllApprovedCandidates();

        for (Position p : positions) {
            Map<String, Object> pMap = new HashMap<>();
            pMap.put("positionId", p.getPositionId());
            pMap.put("positionName", p.getPositionName());
            long pVotes = voteRepository.countByPositionId(p.getPositionId());
            pMap.put("totalVotes", pVotes);

            List<Map<String, Object>> candList = new ArrayList<>();
            for (Candidate c : approvedCandidates) {
                if (c.getPositionId() == p.getPositionId()) {
                    long cVotes = voteRepository.countByCandidateId(c.getCandidateId());
                    Student s = userService.getUserByStudentId(c.getStudentId());
                    Map<String, Object> cMap = new HashMap<>();
                    cMap.put("candidateId", c.getCandidateId());
                    cMap.put("studentId", c.getStudentId());
                    cMap.put("name", s != null ? s.getsName() : "Unknown");
                    cMap.put("votes", cVotes);
                    double share = pVotes > 0 ? ((double) cVotes / pVotes) * 100.0 : 0.0;
                    cMap.put("percentage", Math.round(share * 10.0) / 10.0);
                    candList.add(cMap);
                }
            }
            candList.sort((a, b) -> Long.compare((long) b.get("votes"), (long) a.get("votes")));
            pMap.put("candidates", candList);
            posList.add(pMap);
        }
        data.put("positions", posList);

        // Branch and Year Turnout breakdown
        List<Student> allStudents = userRepository.findAll();
        Set<String> votedSet = new HashSet<>(voteRepository.findDistinctVoterIds());

        Map<String, int[]> branchStats = new TreeMap<>(); // [total, voted]
        Map<String, int[]> yearStats = new TreeMap<>();   // [total, voted]

        for (Student s : allStudents) {
            String roll = s.getStudentId();
            if (roll != null && roll.length() >= 4) {
                String year = roll.substring(0, 2); // e.g. 21, 22
                String branch = roll.length() >= 4 ? roll.substring(2, 4).toUpperCase() : "OTHER";

                branchStats.putIfAbsent(branch, new int[]{0, 0});
                yearStats.putIfAbsent(year, new int[]{0, 0});

                branchStats.get(branch)[0]++;
                yearStats.get(year)[0]++;

                if (votedSet.contains(roll.toUpperCase())) {
                    branchStats.get(branch)[1]++;
                    yearStats.get(year)[1]++;
                }
            }
        }

        List<Map<String, Object>> branchList = new ArrayList<>();
        branchStats.forEach((branch, counts) -> {
            Map<String, Object> bMap = new HashMap<>();
            bMap.put("branch", branch);
            bMap.put("total", counts[0]);
            bMap.put("voted", counts[1]);
            double pct = counts[0] > 0 ? ((double) counts[1] / counts[0]) * 100.0 : 0.0;
            bMap.put("turnout", Math.round(pct * 10.0) / 10.0);
            branchList.add(bMap);
        });
        data.put("branchTurnout", branchList);

        List<Map<String, Object>> yearList = new ArrayList<>();
        yearStats.forEach((year, counts) -> {
            Map<String, Object> yMap = new HashMap<>();
            yMap.put("year", "20" + year + " Batch");
            yMap.put("total", counts[0]);
            yMap.put("voted", counts[1]);
            double pct = counts[0] > 0 ? ((double) counts[1] / counts[0]) * 100.0 : 0.0;
            yMap.put("turnout", Math.round(pct * 10.0) / 10.0);
            yearList.add(yMap);
        });
        data.put("yearTurnout", yearList);

        return ResponseEntity.ok(data);
    }
}
