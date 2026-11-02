package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.entity.Position;
import com.example.repo.PositionRepository;

@Service
public class PositionService {
    @Autowired
    private PositionRepository positionRepository;

    public List<Position> getAllUsers() {
        return positionRepository.findAll(); 
    } 

    public String getName(int positionId){
        Position p = positionRepository.findByPositionId(positionId);

        if (p == null) {
            return null;
        }

        return p.getPositionName();
    }
}