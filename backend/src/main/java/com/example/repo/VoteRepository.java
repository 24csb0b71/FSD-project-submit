package com.example.repo;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.entity.Vote;
import com.example.entity.VoteId;
import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, VoteId> {
    @Query("SELECT COUNT(v) > 0 FROM Vote v WHERE v.voter_id = :voterId AND v.position_id = :positionId")
    boolean existsByVoterAndPosition(@Param("voterId") String voterId, @Param("positionId") int positionId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.candidate_id = :candidateId")
    long countByCandidateId(@Param("candidateId") int candidateId);

    @Query("SELECT COUNT(DISTINCT v.voter_id) FROM Vote v")
    long countDistinctVoters();

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.position_id = :positionId")
    long countByPositionId(@Param("positionId") int positionId);

    @Query("SELECT DISTINCT v.voter_id FROM Vote v")
    List<String> findDistinctVoterIds();
}
