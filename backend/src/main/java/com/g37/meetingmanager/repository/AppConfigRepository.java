package com.g37.meetingmanager.repository;

import com.g37.meetingmanager.model.AppConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppConfigRepository extends JpaRepository<AppConfig, String> {
    
    /**
     * Find app configs by type (source or destination)
     */
    List<AppConfig> findByType(String type);
    
    /**
     * Find active app configs
     */
    List<AppConfig> findByIsActiveTrue();
    
    /**
     * Find app configs by type and active status
     */
    List<AppConfig> findByTypeAndIsActiveTrue(String type);
}