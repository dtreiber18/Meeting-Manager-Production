package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.MeetingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, Long> {
    List<MeetingParticipant> findByMeetingId(Long meetingId);
    List<MeetingParticipant> findByUserId(Long userId);
    List<MeetingParticipant> findByEmail(String email);
    List<MeetingParticipant> findByMeetingIdAndParticipantRole(Long meetingId, MeetingParticipant.ParticipantRole role);
    
    @Query("SELECT mp FROM MeetingParticipant mp WHERE mp.meeting.id = :meetingId AND mp.invitationStatus = :status")
    List<MeetingParticipant> findByMeetingIdAndInvitationStatus(@Param("meetingId") Long meetingId, 
                                                                @Param("status") MeetingParticipant.InvitationStatus status);
    
    @Query("SELECT mp FROM MeetingParticipant mp WHERE mp.user.id = :userId AND mp.attendanceStatus = :status")
    List<MeetingParticipant> findByUserIdAndAttendanceStatus(@Param("userId") Long userId, 
                                                             @Param("status") MeetingParticipant.AttendanceStatus status);
}
