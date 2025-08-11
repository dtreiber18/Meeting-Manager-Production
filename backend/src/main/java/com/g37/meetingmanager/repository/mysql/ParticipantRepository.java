package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
}
