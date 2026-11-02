package com.example.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.entity.ElectionConfig;

@Repository
public interface ElectionConfigRepository extends JpaRepository<ElectionConfig, Integer> {
}
