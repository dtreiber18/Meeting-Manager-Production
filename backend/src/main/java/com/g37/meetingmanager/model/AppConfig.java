package com.g37.meetingmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "app_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppConfig {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String type; // 'source' or 'destination'
    
    @Column(name = "connection_type", nullable = false)
    private String connectionType; // 'api', 'webhook', etc.
    
    @Column(name = "api_url")
    private String apiUrl;
    
    @Column(name = "api_key")
    private String apiKey;
    
    @ElementCollection
    @CollectionTable(name = "app_config_field_mappings",
                    joinColumns = @JoinColumn(name = "app_config_id"))
    @MapKeyColumn(name = "field_name")
    @Column(name = "mapped_value")
    private Map<String, String> fieldMapping;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}