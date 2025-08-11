package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.MeetingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParticipantRepository extends JpaRepository<MeetingParticipant, Long> {
    List<MeetingParticipant> findByMeetingId(Long meetingId);
    List<MeetingParticipant> findByUserId(Long userId);
    List<MeetingParticipant> findByEmail(String email);
    List<MeetingParticipant> findByMeetingIdAndParticipantRole(Long meetingId, MeetingParticipant.ParticipantRole role);
}
