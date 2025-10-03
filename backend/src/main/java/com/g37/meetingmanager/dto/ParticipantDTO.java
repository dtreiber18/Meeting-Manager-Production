package com.g37.meetingmanager.dto;

import com.g37.meetingmanager.model.MeetingParticipant;

public class ParticipantDTO {
    private Long id;
    private String email;
    private String name;
    private String participantRole;
    private String invitationStatus;
    private String attendanceStatus;
    private Boolean isRequired;
    private Boolean canEdit;
    private Boolean canInviteOthers;
    private Boolean attended; // Legacy compatibility

    // Default constructor
    public ParticipantDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getParticipantRole() { return participantRole; }
    public void setParticipantRole(String participantRole) { this.participantRole = participantRole; }

    public String getInvitationStatus() { return invitationStatus; }
    public void setInvitationStatus(String invitationStatus) { this.invitationStatus = invitationStatus; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }

    public Boolean getCanEdit() { return canEdit; }
    public void setCanEdit(Boolean canEdit) { this.canEdit = canEdit; }

    public Boolean getCanInviteOthers() { return canInviteOthers; }
    public void setCanInviteOthers(Boolean canInviteOthers) { this.canInviteOthers = canInviteOthers; }

    public Boolean getAttended() { return attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }

    // Helper method to convert to entity
    public MeetingParticipant toEntity() {
        MeetingParticipant participant = new MeetingParticipant();
        participant.setId(this.id);
        participant.setEmail(this.email);
        participant.setName(this.name);
        participant.setIsRequired(this.isRequired != null ? this.isRequired : true);
        participant.setCanEdit(this.canEdit != null ? this.canEdit : false);
        participant.setCanInviteOthers(this.canInviteOthers != null ? this.canInviteOthers : false);

        if (this.participantRole != null && !this.participantRole.trim().isEmpty()) {
            try {
                participant.setParticipantRole(MeetingParticipant.ParticipantRole.valueOf(this.participantRole.trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                participant.setParticipantRole(MeetingParticipant.ParticipantRole.ATTENDEE);
            }
        } else {
            participant.setParticipantRole(MeetingParticipant.ParticipantRole.ATTENDEE);
        }

        if (this.invitationStatus != null && !this.invitationStatus.trim().isEmpty()) {
            try {
                participant.setInvitationStatus(MeetingParticipant.InvitationStatus.valueOf(this.invitationStatus.trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                participant.setInvitationStatus(MeetingParticipant.InvitationStatus.PENDING);
            }
        } else {
            participant.setInvitationStatus(MeetingParticipant.InvitationStatus.PENDING);
        }

        if (this.attendanceStatus != null && !this.attendanceStatus.trim().isEmpty()) {
            try {
                participant.setAttendanceStatus(MeetingParticipant.AttendanceStatus.valueOf(this.attendanceStatus.trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                participant.setAttendanceStatus(MeetingParticipant.AttendanceStatus.UNKNOWN);
            }
        } else {
            participant.setAttendanceStatus(MeetingParticipant.AttendanceStatus.UNKNOWN);
        }

        if (this.attended != null) {
            participant.setAttended(this.attended);
        }

        return participant;
    }
}
