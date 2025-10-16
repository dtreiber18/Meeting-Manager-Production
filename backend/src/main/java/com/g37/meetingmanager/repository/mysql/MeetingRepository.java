package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    Optional<Meeting> findByFathomRecordingId(String fathomRecordingId);

    @Query("SELECT m FROM Meeting m LEFT JOIN FETCH m.organization LEFT JOIN FETCH m.organizer")
    List<Meeting> findAllWithOrganizationAndOrganizer();

    @Query("SELECT m FROM Meeting m LEFT JOIN FETCH m.organization LEFT JOIN FETCH m.organizer WHERE m.id = :id")
    Optional<Meeting> findByIdWithOrganizationAndOrganizer(Long id);
}
