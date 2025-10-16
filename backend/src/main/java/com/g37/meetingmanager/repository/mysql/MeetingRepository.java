package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    Optional<Meeting> findByFathomRecordingId(String fathomRecordingId);
}
