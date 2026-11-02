package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.example.entity.Position;
import com.example.service.PositionService;

@RestController
@RequestMapping("/api/position")
@CrossOrigin(origins = "http://localhost:5173")

public class PositionController {
    @Autowired
    private PositionService positionService;

    @GetMapping("/all")
    public List<Position> getAll() {
        return positionService.getAllUsers();
    }

    @GetMapping("/{positionId}/name")
    public String getName(@PathVariable int positionId) {
        return positionService.getName(positionId);
    }

}