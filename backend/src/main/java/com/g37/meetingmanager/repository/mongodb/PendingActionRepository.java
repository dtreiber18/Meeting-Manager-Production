package com.g37.meetingmanager.repository.mongodb;

import com.g37.meetingmanager.model.PendingAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PendingActionRepository extends MongoRepository<PendingAction, String> {
    
    /**
     * Find all pending actions for a specific meeting
     */
    List<PendingAction> findByMeetingIdOrderByCreatedAtDesc(Long meetingId);
    
    /**
     * Find all pending actions for a specific meeting with pagination
     */
    Page<PendingAction> findByMeetingId(Long meetingId, Pageable pageable);
    
    /**
     * Find pending actions by status
     */
    List<PendingAction> findByStatusOrderByCreatedAtDesc(PendingAction.ActionStatus status);
    
    /**
     * Find pending actions by assignee
     */
    List<PendingAction> findByAssigneeIdOrderByDueDateAsc(Long assigneeId);
    
    /**
     * Find pending actions by assignee and status
     */
    List<PendingAction> findByAssigneeIdAndStatusOrderByDueDateAsc(Long assigneeId, PendingAction.ActionStatus status);
    
    /**
     * Find overdue pending actions
     */
    @Query("{'dueDate': {$lt: ?0}, 'status': {$in: ['NEW', 'ACTIVE']}}")
    List<PendingAction> findOverduePendingActions(LocalDateTime currentTime);
    
    /**
     * Find pending actions due soon (within specified date)
     */
    @Query("{'dueDate': {$gte: ?0, $lte: ?1}, 'status': {$in: ['NEW', 'ACTIVE']}}")
    List<PendingAction> findPendingActionsDueBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find pending actions by organization
     */
    List<PendingAction> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
    
    /**
     * Find pending actions by priority
     */
    List<PendingAction> findByPriorityOrderByCreatedAtDesc(PendingAction.Priority priority);
    
    /**
     * Find pending actions that need approval (status = NEW)
     */
    List<PendingAction> findByStatusOrderByCreatedAtAsc(PendingAction.ActionStatus status);
    
    /**
     * Find pending actions with external system integration
     */
    List<PendingAction> findByExternalSystemIsNotNullOrderByCreatedAtDesc();
    
    /**
     * Find pending actions by action management systems
     */
    @Query("{'actionManagementSystems': {$in: [?0]}}")
    List<PendingAction> findByActionManagementSystemsContaining(PendingAction.ActionManagementSystem system);
    
    /**
     * Find pending actions with specific N8N workflow status
     */
    List<PendingAction> findByN8nWorkflowStatusOrderByCreatedAtDesc(String workflowStatus);
    
    /**
     * Count pending actions by status for dashboard/statistics
     */
    long countByStatus(PendingAction.ActionStatus status);
    
    /**
     * Count pending actions by assignee
     */
    long countByAssigneeId(Long assigneeId);
    
    /**
     * Count overdue pending actions
     */
    @Query(value = "{'dueDate': {$lt: ?0}, 'status': {$in: ['NEW', 'ACTIVE']}}", count = true)
    long countOverduePendingActions(LocalDateTime currentTime);
    
    /**
     * Find pending actions by multiple criteria using custom query
     */
    @Query("{'$and': [" +
           "{'$or': [{'assigneeId': ?0}, {'reporterId': ?0}]}," +
           "{'organizationId': ?1}," +
           "{'status': {$in: ?2}}" +
           "]}")
    Page<PendingAction> findByUserAndOrganizationAndStatuses(
        Long userId, 
        Long organizationId, 
        List<PendingAction.ActionStatus> statuses, 
        Pageable pageable
    );
    
    /**
     * Search pending actions by text in title or description
     */
    @Query("{'$and': [" +
           "{'$or': [" +
           "{'title': {$regex: ?0, $options: 'i'}}," +
           "{'description': {$regex: ?0, $options: 'i'}}" +
           "]}," +
           "{'organizationId': ?1}" +
           "]}")
    List<PendingAction> searchByTextAndOrganization(String searchText, Long organizationId);
    
    /**
     * Find pending actions created between dates
     */
    List<PendingAction> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find pending actions by meeting ObjectId (for MongoDB-based meetings)
     */
    List<PendingAction> findByMeetingObjectIdOrderByCreatedAtDesc(String meetingObjectId);
    
    /**
     * Delete all pending actions for a specific meeting
     */
    void deleteByMeetingId(Long meetingId);
    
    /**
     * Delete all pending actions for a specific meeting ObjectId
     */
    void deleteByMeetingObjectId(String meetingObjectId);
}