package com.g37.meetingmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "permissions", indexes = {
    @Index(columnList = "name", unique = true),
    @Index(columnList = "category")
})
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, unique = true)
    private String name;

    @Size(max = 255)
    private String description;

    @Size(max = 50)
    private String category;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Role> roles;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Permission() {}

    public Permission(String name, String description, String category) {
        this.name = name;
        this.description = description;
        this.category = category;
    }

    // Permission constants
    public static final String CREATE_MEETING = "CREATE_MEETING";
    public static final String EDIT_MEETING = "EDIT_MEETING";
    public static final String DELETE_MEETING = "DELETE_MEETING";
    public static final String VIEW_MEETING = "VIEW_MEETING";
    public static final String MANAGE_PARTICIPANTS = "MANAGE_PARTICIPANTS";
    public static final String MANAGE_ACTION_ITEMS = "MANAGE_ACTION_ITEMS";
    public static final String VIEW_ANALYTICS = "VIEW_ANALYTICS";
    public static final String MANAGE_ORGANIZATION = "MANAGE_ORGANIZATION";
    public static final String MANAGE_USERS = "MANAGE_USERS";
    public static final String MANAGE_ROLES = "MANAGE_ROLES";
    public static final String ACCESS_AI_FEATURES = "ACCESS_AI_FEATURES";
    public static final String EXPORT_DATA = "EXPORT_DATA";

    // Permission categories
    public static final String CATEGORY_MEETING = "MEETING";
    public static final String CATEGORY_USER = "USER";
    public static final String CATEGORY_ORGANIZATION = "ORGANIZATION";
    public static final String CATEGORY_AI = "AI";
    public static final String CATEGORY_DATA = "DATA";

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
}
