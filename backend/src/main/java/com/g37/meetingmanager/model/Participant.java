package com.g37.meetingmanager.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Participant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String email;
    private Boolean attended = false;
    
    // Enhanced classification system
    @Enumerated(EnumType.STRING)
    private ParticipantType participantType = ParticipantType.OTHER;
    
    @Enumerated(EnumType.STRING)
    private ParticipantRole participantRole = ParticipantRole.ATTENDEE;
    
    private String department;
    private String organization;
    private String title;
    private String phoneNumber;
    private String timezone;
    private String preferredLanguage;
    
    // Status and attendance
    @Enumerated(EnumType.STRING)
    private InvitationStatus invitationStatus = InvitationStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    private AttendanceStatus attendanceStatus = AttendanceStatus.PENDING;
    
    private Boolean isRequired = false;
    
    // Permissions and roles
    private Boolean canEdit = false;
    private Boolean canInviteOthers = false;
    private Boolean internal = false;
    @Column(name = "is_external")
    private Boolean external = true;
    private Boolean organizer = false;
    private Boolean presenter = false;
    
    // Time tracking
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Integer attendanceDurationMinutes;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime lastReminderSentAt;
    
    // Additional metadata
    private String notes;
    private String avatar;
    private String linkedInProfile;
    private String companyWebsite;
    
    // System fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    @JsonIgnore
    private Meeting meeting;

    // Enums
    public enum ParticipantType {
        CLIENT, G37, OTHER
    }
    
    public enum ParticipantRole {
        ATTENDEE, ORGANIZER, PRESENTER, OBSERVER
    }
    
    public enum InvitationStatus {
        PENDING, SENT, ACCEPTED, DECLINED, TENTATIVE
    }
    
    public enum AttendanceStatus {
        PENDING, PRESENT, ABSENT, LATE, LEFT_EARLY
    }

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (invitedAt == null) {
            invitedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Boolean getAttended() { return attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }
    
    public ParticipantType getParticipantType() { return participantType; }
    public void setParticipantType(ParticipantType participantType) { this.participantType = participantType; }
    
    public ParticipantRole getParticipantRole() { return participantRole; }
    public void setParticipantRole(ParticipantRole participantRole) { this.participantRole = participantRole; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    
    public InvitationStatus getInvitationStatus() { return invitationStatus; }
    public void setInvitationStatus(InvitationStatus invitationStatus) { this.invitationStatus = invitationStatus; }
    
    public AttendanceStatus getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(AttendanceStatus attendanceStatus) { this.attendanceStatus = attendanceStatus; }
    
    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }
    
    public Boolean getCanEdit() { return canEdit; }
    public void setCanEdit(Boolean canEdit) { this.canEdit = canEdit; }
    
    public Boolean getCanInviteOthers() { return canInviteOthers; }
    public void setCanInviteOthers(Boolean canInviteOthers) { this.canInviteOthers = canInviteOthers; }
    
    public Boolean getInternal() { return internal; }
    public void setInternal(Boolean internal) { this.internal = internal; }
    
    public Boolean getExternal() { return external; }
    public void setExternal(Boolean external) { this.external = external; }
    
    public Boolean getOrganizer() { return organizer; }
    public void setOrganizer(Boolean organizer) { this.organizer = organizer; }
    
    public Boolean getPresenter() { return presenter; }
    public void setPresenter(Boolean presenter) { this.presenter = presenter; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    
    public LocalDateTime getLeftAt() { return leftAt; }
    public void setLeftAt(LocalDateTime leftAt) { this.leftAt = leftAt; }
    
    public Integer getAttendanceDurationMinutes() { return attendanceDurationMinutes; }
    public void setAttendanceDurationMinutes(Integer attendanceDurationMinutes) { this.attendanceDurationMinutes = attendanceDurationMinutes; }
    
    public LocalDateTime getInvitedAt() { return invitedAt; }
    public void setInvitedAt(LocalDateTime invitedAt) { this.invitedAt = invitedAt; }
    
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    
    public LocalDateTime getLastReminderSentAt() { return lastReminderSentAt; }
    public void setLastReminderSentAt(LocalDateTime lastReminderSentAt) { this.lastReminderSentAt = lastReminderSentAt; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    
    public String getLinkedInProfile() { return linkedInProfile; }
    public void setLinkedInProfile(String linkedInProfile) { this.linkedInProfile = linkedInProfile; }
    
    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }
}
