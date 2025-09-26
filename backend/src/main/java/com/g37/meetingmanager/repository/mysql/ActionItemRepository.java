package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.ActionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActionItemRepository extends JpaRepository<ActionItem, Long>, JpaSpecificationExecutor<ActionItem> {

    /**
     * Find action items by assignee ID
     */
    Page<ActionItem> findByAssigneeId(Long assigneeId, Pageable pageable);

    /**
     * Find action items by reporter ID
     */
    Page<ActionItem> findByReporterId(Long reporterId, Pageable pageable);

    /**
     * Find action items by meeting ID
     */
    Page<ActionItem> findByMeetingId(Long meetingId, Pageable pageable);

    /**
     * Find action items by status
     */
    Page<ActionItem> findByStatus(ActionItem.ActionItemStatus status, Pageable pageable);

    /**
     * Find action items by priority
     */
    Page<ActionItem> findByPriority(ActionItem.Priority priority, Pageable pageable);

    /**
     * Find action items by completion status
     */
    Page<ActionItem> findByCompleted(Boolean completed, Pageable pageable);

    /**
     * Find overdue action items (not completed and past due date)
     */
    @Query("SELECT ai FROM ActionItem ai WHERE ai.completed = false AND ai.dueDate < :now AND ai.dueDate IS NOT NULL")
    List<ActionItem> findOverdueActionItems(@Param("now") LocalDateTime now);

    /**
     * Find action items due soon (within specified date range)
     */
    @Query("SELECT ai FROM ActionItem ai WHERE ai.completed = false AND ai.dueDate BETWEEN :start AND :end")
    List<ActionItem> findActionItemsDueSoon(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Find action items by assignee and status
     */
    Page<ActionItem> findByAssigneeIdAndStatus(Long assigneeId, ActionItem.ActionItemStatus status, Pageable pageable);

    /**
     * Find action items by assignee and completion status
     */
    Page<ActionItem> findByAssigneeIdAndCompleted(Long assigneeId, Boolean completed, Pageable pageable);

    /**
     * Find action items by assignee and priority
     */
    Page<ActionItem> findByAssigneeIdAndPriority(Long assigneeId, ActionItem.Priority priority, Pageable pageable);

    /**
     * Search action items by title or description
     */
    @Query("SELECT ai FROM ActionItem ai WHERE " +
           "LOWER(ai.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(ai.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(ai.notes) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<ActionItem> searchActionItems(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find action items with subtasks
     */
    @Query("SELECT ai FROM ActionItem ai WHERE ai.subTasks IS NOT EMPTY")
    Page<ActionItem> findActionItemsWithSubTasks(Pageable pageable);

    /**
     * Find action items that are subtasks (have parent)
     */
    @Query("SELECT ai FROM ActionItem ai WHERE ai.parentActionItem IS NOT NULL")
    Page<ActionItem> findSubTaskActionItems(Pageable pageable);

    /**
     * Count action items by status for a specific assignee
     */
    @Query("SELECT COUNT(ai) FROM ActionItem ai WHERE ai.assignee.id = :assigneeId AND ai.status = :status")
    long countByAssigneeIdAndStatus(@Param("assigneeId") Long assigneeId, @Param("status") ActionItem.ActionItemStatus status);

    /**
     * Count completed action items for a specific assignee
     */
    @Query("SELECT COUNT(ai) FROM ActionItem ai WHERE ai.assignee.id = :assigneeId AND ai.completed = true")
    long countCompletedByAssigneeId(@Param("assigneeId") Long assigneeId);

    /**
     * Count overdue action items for a specific assignee
     */
    @Query("SELECT COUNT(ai) FROM ActionItem ai WHERE ai.assignee.id = :assigneeId AND ai.completed = false AND ai.dueDate < :now AND ai.dueDate IS NOT NULL")
    long countOverdueByAssigneeId(@Param("assigneeId") Long assigneeId, @Param("now") LocalDateTime now);

    /**
     * Find action items by organization ID
     */
    Page<ActionItem> findByOrganizationId(Long organizationId, Pageable pageable);

    /**
     * Find action items created within date range
     */
    @Query("SELECT ai FROM ActionItem ai WHERE ai.createdAt BETWEEN :start AND :end")
    Page<ActionItem> findActionItemsCreatedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    /**
     * Find action items updated within date range
     */
    @Query("SELECT ai FROM ActionItem ai WHERE ai.updatedAt BETWEEN :start AND :end")
    Page<ActionItem> findActionItemsUpdatedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);

    /**
     * Find action items by type
     */
    Page<ActionItem> findByType(ActionItem.ActionItemType type, Pageable pageable);

    /**
     * Find recurring action items
     */
    Page<ActionItem> findByIsRecurring(Boolean isRecurring, Pageable pageable);

    /**
     * Find action items with tags containing specific text
     */
    @Query("SELECT ai FROM ActionItem ai WHERE LOWER(ai.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    Page<ActionItem> findActionItemsByTag(@Param("tag") String tag, Pageable pageable);
}
