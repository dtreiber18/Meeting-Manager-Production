package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Support Ticket operations
 */
@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    
    /**
     * Find ticket by ticket number
     */
    Optional<SupportTicket> findByTicketNumber(String ticketNumber);
    
    /**
     * Find tickets by user
     */
    List<SupportTicket> findBySubmittedByOrderByCreatedAtDesc(Long submittedBy);
    
    /**
     * Find tickets by user with pagination
     */
    Page<SupportTicket> findBySubmittedBy(Long submittedBy, Pageable pageable);
    
    /**
     * Find tickets by status
     */
    List<SupportTicket> findByStatusOrderByCreatedAtDesc(SupportTicket.Status status);
    
    /**
     * Find tickets by status with pagination
     */
    Page<SupportTicket> findByStatus(SupportTicket.Status status, Pageable pageable);
    
    /**
     * Find tickets by priority
     */
    List<SupportTicket> findByPriorityOrderByCreatedAtDesc(SupportTicket.Priority priority);
    
    /**
     * Find tickets by priority with pagination
     */
    Page<SupportTicket> findByPriority(SupportTicket.Priority priority, Pageable pageable);
    
    /**
     * Find tickets by category
     */
    List<SupportTicket> findByCategoryOrderByCreatedAtDesc(SupportTicket.Category category);
    
    /**
     * Find tickets by category with pagination
     */
    Page<SupportTicket> findByCategory(SupportTicket.Category category, Pageable pageable);
    
    /**
     * Find tickets assigned to a specific user
     */
    List<SupportTicket> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);
    
    /**
     * Find tickets assigned to a specific user with pagination
     */
    Page<SupportTicket> findByAssignedTo(Long assignedTo, Pageable pageable);
    
    /**
     * Find open tickets (open, in progress, waiting for customer)
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.status IN ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER') ORDER BY t.priority DESC, t.createdAt ASC")
    List<SupportTicket> findOpenTickets();
    
    /**
     * Find open tickets with pagination
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.status IN ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER') ORDER BY t.priority DESC, t.createdAt ASC")
    Page<SupportTicket> findOpenTickets(Pageable pageable);
    
    /**
     * Find resolved tickets
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.status IN ('RESOLVED', 'CLOSED') ORDER BY t.resolvedAt DESC")
    List<SupportTicket> findResolvedTickets();
    
    /**
     * Find resolved tickets with pagination
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.status IN ('RESOLVED', 'CLOSED') ORDER BY t.resolvedAt DESC")
    Page<SupportTicket> findResolvedTickets(Pageable pageable);
    
    /**
     * Find unassigned tickets
     */
    List<SupportTicket> findByAssignedToIsNullOrderByPriorityDescCreatedAtAsc();
    
    /**
     * Find unassigned tickets with pagination
     */
    Page<SupportTicket> findByAssignedToIsNull(Pageable pageable);
    
    /**
     * Search tickets by subject or description
     */
    @Query("SELECT t FROM SupportTicket t WHERE " +
           "LOWER(t.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY t.createdAt DESC")
    List<SupportTicket> searchTickets(@Param("searchTerm") String searchTerm);
    
    /**
     * Search tickets by subject or description with pagination
     */
    @Query("SELECT t FROM SupportTicket t WHERE " +
           "LOWER(t.subject) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "ORDER BY t.createdAt DESC")
    Page<SupportTicket> searchTickets(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find tickets created within date range
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<SupportTicket> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find tickets resolved within date range
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.resolvedAt BETWEEN :startDate AND :endDate ORDER BY t.resolvedAt DESC")
    List<SupportTicket> findByResolvedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
    
    /**
     * Count tickets by status
     */
    long countByStatus(SupportTicket.Status status);
    
    /**
     * Count tickets by priority
     */
    long countByPriority(SupportTicket.Priority priority);
    
    /**
     * Count tickets by category
     */
    long countByCategory(SupportTicket.Category category);
    
    /**
     * Count open tickets
     */
    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.status IN ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER')")
    long countOpenTickets();
    
    /**
     * Count resolved tickets
     */
    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.status IN ('RESOLVED', 'CLOSED')")
    long countResolvedTickets();
    
    /**
     * Count unassigned tickets
     */
    long countByAssignedToIsNull();
    
    /**
     * Count tickets by user
     */
    long countBySubmittedBy(Long submittedBy);
    
    /**
     * Count tickets assigned to user
     */
    long countByAssignedTo(Long assignedTo);
    
    /**
     * Get tickets count by status
     */
    @Query("SELECT t.status, COUNT(t) FROM SupportTicket t GROUP BY t.status")
    List<Object[]> getTicketCountByStatus();
    
    /**
     * Get tickets count by priority
     */
    @Query("SELECT t.priority, COUNT(t) FROM SupportTicket t GROUP BY t.priority")
    List<Object[]> getTicketCountByPriority();
    
    /**
     * Get tickets count by category
     */
    @Query("SELECT t.category, COUNT(t) FROM SupportTicket t GROUP BY t.category")
    List<Object[]> getTicketCountByCategory();
    
    /**
     * Get average resolution time in hours
     */
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, t.createdAt, t.resolvedAt)) FROM SupportTicket t WHERE t.resolvedAt IS NOT NULL")
    Double getAverageResolutionTimeInHours();
    
    /**
     * Get average resolution time by priority
     */
    @Query("SELECT t.priority, AVG(TIMESTAMPDIFF(HOUR, t.createdAt, t.resolvedAt)) FROM SupportTicket t WHERE t.resolvedAt IS NOT NULL GROUP BY t.priority")
    List<Object[]> getAverageResolutionTimeByPriority();
    
    /**
     * Get oldest open tickets
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.status IN ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER') ORDER BY t.createdAt ASC")
    List<SupportTicket> findOldestOpenTickets(Pageable pageable);
    
    /**
     * Find tickets by user and status
     */
    List<SupportTicket> findBySubmittedByAndStatusOrderByCreatedAtDesc(Long submittedBy, SupportTicket.Status status);
    
    /**
     * Find tickets by priority and status
     */
    List<SupportTicket> findByPriorityAndStatusOrderByCreatedAtDesc(SupportTicket.Priority priority, SupportTicket.Status status);
    
    /**
     * Check if ticket number exists
     */
    boolean existsByTicketNumber(String ticketNumber);
}