package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.AISuggestion;
import com.g37.meetingmanager.model.AISuggestion.SuggestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AISuggestionRepository extends JpaRepository<AISuggestion, Long> {

    /**
     * Find all suggestions for a specific meeting
     */
    List<AISuggestion> findByMeetingId(Long meetingId);

    /**
     * Find suggestions for a meeting by status
     */
    List<AISuggestion> findByMeetingIdAndStatus(Long meetingId, SuggestionStatus status);

    /**
     * Find all pending suggestions for a meeting
     */
    @Query("SELECT s FROM AISuggestion s WHERE s.meetingId = :meetingId AND s.status = 'PENDING' ORDER BY s.priority DESC, s.createdAt DESC")
    List<AISuggestion> findPendingSuggestionsByMeetingId(@Param("meetingId") Long meetingId);

    /**
     * Find all suggestions by status
     */
    List<AISuggestion> findByStatus(SuggestionStatus status);

    /**
     * Find suggestions created after a specific date
     */
    List<AISuggestion> findByCreatedAtAfter(LocalDateTime after);

    /**
     * Find suggestions sent to a specific system
     */
    List<AISuggestion> findBySentToSystem(String system);

    /**
     * Count pending suggestions for a meeting
     */
    @Query("SELECT COUNT(s) FROM AISuggestion s WHERE s.meetingId = :meetingId AND s.status = 'PENDING'")
    long countPendingSuggestionsByMeetingId(@Param("meetingId") Long meetingId);

    /**
     * Delete all suggestions for a specific meeting
     */
    void deleteByMeetingId(Long meetingId);
}
