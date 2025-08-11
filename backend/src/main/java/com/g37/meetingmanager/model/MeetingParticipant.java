package com.g37.meetingmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_participants", indexes = {
    @Index(columnList = "meetingId"),
    @Index(columnList = "userId"),
    @Index(columnList = "participantRole"),
    @Index(columnList = "invitationStatus"),
    @Index(columnList = "attendanceStatus")
})
public class MeetingParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @Column(nullable = false)
    private String email;

    private String name; // For external participants without user accounts

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipantRole participantRole = ParticipantRole.ATTENDEE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus invitationStatus = InvitationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus attendanceStatus = AttendanceStatus.UNKNOWN;

    @Column(nullable = false)
    private Boolean isRequired = true;

    @Column(nullable = false)
    private Boolean canEdit = false;

    @Column(nullable = false)
    private Boolean canInviteOthers = false;

    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private Integer attendanceDurationMinutes;

    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime lastReminderSentAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Null for external participants

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

    // Constructors
    public MeetingParticipant() {}

    public MeetingParticipant(Meeting meeting, User user, ParticipantRole role) {
        this.meeting = meeting;
        this.user = user;
        this.email = user.getEmail();
        this.name = user.getFullName();
        this.participantRole = role;
    }

    public MeetingParticipant(Meeting meeting, String email, String name, ParticipantRole role) {
        this.meeting = meeting;
        this.email = email;
        this.name = name;
        this.participantRole = role;
    }

    // Helper methods
    public boolean isInternal() {
        return user != null;
    }

    public boolean isExternal() {
        return user == null;
    }

    public boolean hasAccepted() {
        return invitationStatus == InvitationStatus.ACCEPTED;
    }

    public boolean hasDeclined() {
        return invitationStatus == InvitationStatus.DECLINED;
    }

    public boolean isOrganizer() {
        return participantRole == ParticipantRole.ORGANIZER;
    }

    public boolean isPresenter() {
        return participantRole == ParticipantRole.PRESENTER;
    }

    public void markAsJoined() {
        this.joinedAt = LocalDateTime.now();
        this.attendanceStatus = AttendanceStatus.PRESENT;
    }

    public void markAsLeft() {
        this.leftAt = LocalDateTime.now();
        if (joinedAt != null) {
            this.attendanceDurationMinutes = (int) java.time.Duration.between(joinedAt, leftAt).toMinutes();
        }
    }

    // Enums
    public enum ParticipantRole {
        ORGANIZER,
        PRESENTER,
        ATTENDEE,
        OPTIONAL,
        OBSERVER
    }

    public enum InvitationStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        TENTATIVE,
        NO_RESPONSE
    }

    public enum AttendanceStatus {
        UNKNOWN,
        PRESENT,
        ABSENT,
        LATE,
        LEFT_EARLY
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ParticipantRole getParticipantRole() { return participantRole; }
    public void setParticipantRole(ParticipantRole participantRole) { this.participantRole = participantRole; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Meeting getMeeting() { return meeting; }
    public void setMeeting(Meeting meeting) { this.meeting = meeting; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Legacy compatibility
    public Boolean getAttended() { 
        return attendanceStatus == AttendanceStatus.PRESENT;
    }
    
    public void setAttended(Boolean attended) {
        if (attended != null) {
            this.attendanceStatus = attended ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
        }
    }
}
