package com.g37.meetingmanager.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.g37.meetingmanager.model.ActionItem;
import com.g37.meetingmanager.model.User;
import com.g37.meetingmanager.repository.mysql.ActionItemRepository;
import com.g37.meetingmanager.repository.mysql.UserRepository;

import jakarta.persistence.criteria.Predicate;

@Service
@Transactional
public class ActionItemService {

    private static final String ACTION_ITEM_NOT_FOUND = "Action item not found with id: ";
    private static final String ASSIGNEE_FIELD = "assignee";
    private static final String COMPLETED_FIELD = "completed";
    private static final String DUE_DATE_FIELD = "dueDate";

    private final ActionItemRepository actionItemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ActionItemService(ActionItemRepository actionItemRepository, 
                            UserRepository userRepository,
                            NotificationService notificationService) {
        this.actionItemRepository = actionItemRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Get all action items with optional filtering
     */
    public Page<ActionItem> getAllActionItems(
            String status,
            String priority,
            Long assigneeId,
            Boolean overdue,
            Boolean completed,
            String search,
            Pageable pageable) {
        
        Specification<ActionItem> spec = createSpecification(status, priority, assigneeId, overdue, completed, search);
        return actionItemRepository.findAll(spec, pageable);
    }

    /**
     * Get action item by ID
     */
    public Optional<ActionItem> getActionItemById(Long id) {
        return actionItemRepository.findById(id);
    }

    /**
     * Get action items assigned to a specific user
     */
    public Page<ActionItem> getActionItemsByAssignee(Long assigneeId, Pageable pageable) {
        Specification<ActionItem> spec = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get(ASSIGNEE_FIELD).get("id"), assigneeId);
        return actionItemRepository.findAll(spec, pageable);
    }

    /**
     * Get action items reported by a specific user
     */
    public Page<ActionItem> getActionItemsByReporter(Long reporterId, Pageable pageable) {
        Specification<ActionItem> spec = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("reporter").get("id"), reporterId);
        return actionItemRepository.findAll(spec, pageable);
    }

    /**
     * Get overdue action items
     */
    public List<ActionItem> getOverdueActionItems() {
        Specification<ActionItem> spec = (root, query, criteriaBuilder) -> {
            Predicate notCompleted = criteriaBuilder.equal(root.get(COMPLETED_FIELD), false);
            Predicate pastDue = criteriaBuilder.lessThan(root.get(DUE_DATE_FIELD), LocalDateTime.now());
            Predicate hasDueDate = criteriaBuilder.isNotNull(root.get(DUE_DATE_FIELD));
            return criteriaBuilder.and(notCompleted, pastDue, hasDueDate);
        };
        return actionItemRepository.findAll(spec);
    }

    /**
     * Get action items due soon (within specified days)
     */
    public List<ActionItem> getActionItemsDueSoon(int days) {
        Specification<ActionItem> spec = (root, query, criteriaBuilder) -> {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime future = now.plusDays(days);
            
            Predicate notCompleted = criteriaBuilder.equal(root.get(COMPLETED_FIELD), false);
            Predicate dueSoon = criteriaBuilder.between(root.get(DUE_DATE_FIELD), now, future);
            return criteriaBuilder.and(notCompleted, dueSoon);
        };
        return actionItemRepository.findAll(spec);
    }

    /**
     * Create a new action item
     */
    public ActionItem createActionItem(ActionItem actionItem, Long assigneeId, Long reporterId) {
        // Set assignee and reporter
        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee not found with id: " + assigneeId));
            actionItem.setAssignee(assignee);
        }

        if (reporterId != null) {
            User reporter = userRepository.findById(reporterId)
                    .orElseThrow(() -> new RuntimeException("Reporter not found with id: " + reporterId));
            actionItem.setReporter(reporter);
        }

        // Save the action item
        ActionItem savedActionItem = actionItemRepository.save(actionItem);

        // Create notification for assignee if different from reporter
        if (savedActionItem.getAssignee() != null && 
            !savedActionItem.getAssignee().getId().equals(reporterId)) {
            notificationService.createActionItemAssignment(
                savedActionItem.getAssignee().getId(),
                savedActionItem.getTitle(),
                savedActionItem.getId().toString()
            );
        }

        return savedActionItem;
    }

    /**
     * Update an existing action item
     */
    public ActionItem updateActionItem(Long id, ActionItem actionItemDetails) {
        ActionItem actionItem = actionItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ACTION_ITEM_NOT_FOUND + id));

        // Update basic fields
        actionItem.setTitle(actionItemDetails.getTitle());
        actionItem.setDescription(actionItemDetails.getDescription());
        actionItem.setStatus(actionItemDetails.getStatus());
        actionItem.setPriority(actionItemDetails.getPriority());
        actionItem.setType(actionItemDetails.getType());
        actionItem.setDueDate(actionItemDetails.getDueDate());
        actionItem.setStartDate(actionItemDetails.getStartDate());
        actionItem.setEstimatedHours(actionItemDetails.getEstimatedHours());
        actionItem.setActualHours(actionItemDetails.getActualHours());
        actionItem.setNotes(actionItemDetails.getNotes());
        actionItem.setTags(actionItemDetails.getTags());
        actionItem.setIsRecurring(actionItemDetails.getIsRecurring());
        actionItem.setRecurringPattern(actionItemDetails.getRecurringPattern());

        // Handle completion status
        if (actionItemDetails.getCompleted() != null && !actionItemDetails.getCompleted().equals(actionItem.getCompleted())) {
            if (Boolean.TRUE.equals(actionItemDetails.getCompleted())) {
                actionItem.markAsCompleted();
                actionItem.setCompletionNotes(actionItemDetails.getCompletionNotes());
            } else {
                actionItem.markAsInProgress();
            }
        }

        return actionItemRepository.save(actionItem);
    }

    /**
     * Mark action item as completed
     */
    public ActionItem markAsCompleted(Long id, String completionNotes) {
        ActionItem actionItem = actionItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ACTION_ITEM_NOT_FOUND + id));

        actionItem.markAsCompleted();
        if (completionNotes != null && !completionNotes.trim().isEmpty()) {
            actionItem.setCompletionNotes(completionNotes);
        }

        ActionItem savedActionItem = actionItemRepository.save(actionItem);

        // Notify reporter if different from assignee
        if (savedActionItem.getReporter() != null && 
            savedActionItem.getAssignee() != null &&
            !savedActionItem.getReporter().getId().equals(savedActionItem.getAssignee().getId())) {
            notificationService.createActionItemCompleted(
                savedActionItem.getReporter().getId(),
                savedActionItem.getTitle(),
                savedActionItem.getId().toString(),
                savedActionItem.getAssignee().getFullName()
            );
        }

        return savedActionItem;
    }

    /**
     * Mark action item as in progress
     */
    public ActionItem markAsInProgress(Long id) {
        ActionItem actionItem = actionItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ACTION_ITEM_NOT_FOUND + id));

        actionItem.markAsInProgress();
        return actionItemRepository.save(actionItem);
    }

    /**
     * Delete an action item
     */
    public void deleteActionItem(Long id) {
        ActionItem actionItem = actionItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(ACTION_ITEM_NOT_FOUND + id));
        
        actionItemRepository.delete(actionItem);
    }

    /**
     * Add a subtask to an action item
     */
    public ActionItem addSubTask(Long parentId, ActionItem subTask, Long assigneeId) {
        ActionItem parent = actionItemRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent action item not found with id: " + parentId));

        // Set assignee if provided
        if (assigneeId != null) {
            User assignee = userRepository.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee not found with id: " + assigneeId));
            subTask.setAssignee(assignee);
        }

        // Set parent relationship
        subTask.setParentActionItem(parent);
        subTask.setMeeting(parent.getMeeting());
        subTask.setOrganization(parent.getOrganization());

        ActionItem savedSubTask = actionItemRepository.save(subTask);
        parent.addSubTask(savedSubTask);
        
        return actionItemRepository.save(parent);
    }

    /**
     * Get statistics for action items
     */
    public ActionItemStatistics getStatistics(Long userId) {
        Specification<ActionItem> userAssignedSpec = (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get(ASSIGNEE_FIELD).get("id"), userId);

        List<ActionItem> userActionItems = actionItemRepository.findAll(userAssignedSpec);

        long total = userActionItems.size();
        long completed = userActionItems.stream().mapToLong(ai -> Boolean.TRUE.equals(ai.getCompleted()) ? 1 : 0).sum();
        long overdue = userActionItems.stream().mapToLong(ai -> ai.isOverdue() ? 1 : 0).sum();
        long dueSoon = userActionItems.stream().mapToLong(ai -> ai.isDueSoon(7) ? 1 : 0).sum();
        long inProgress = userActionItems.stream()
                .mapToLong(ai -> ai.getStatus() == ActionItem.ActionItemStatus.IN_PROGRESS ? 1 : 0).sum();

        return new ActionItemStatistics(total, completed, overdue, dueSoon, inProgress);
    }

    /**
     * Create specification for filtering action items
     */
    private Specification<ActionItem> createSpecification(
            String status, String priority, Long assigneeId, 
            Boolean overdue, Boolean completed, String search) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status filter
            if (status != null && !status.isEmpty()) {
                try {
                    ActionItem.ActionItemStatus statusEnum = ActionItem.ActionItemStatus.valueOf(status.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), statusEnum));
                } catch (IllegalArgumentException e) {
                    // Invalid status, ignore
                }
            }

            // Priority filter
            if (priority != null && !priority.isEmpty()) {
                try {
                    ActionItem.Priority priorityEnum = ActionItem.Priority.valueOf(priority.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("priority"), priorityEnum));
                } catch (IllegalArgumentException e) {
                    // Invalid priority, ignore
                }
            }

            // Assignee filter
            if (assigneeId != null) {
                predicates.add(criteriaBuilder.equal(root.get(ASSIGNEE_FIELD).get("id"), assigneeId));
            }

            // Overdue filter
            if (overdue != null && overdue) {
                predicates.add(criteriaBuilder.equal(root.get(COMPLETED_FIELD), false));
                predicates.add(criteriaBuilder.lessThan(root.get(DUE_DATE_FIELD), LocalDateTime.now()));
                predicates.add(criteriaBuilder.isNotNull(root.get(DUE_DATE_FIELD)));
            }

            // Completed filter
            if (completed != null) {
                predicates.add(criteriaBuilder.equal(root.get(COMPLETED_FIELD), completed));
            }

            // Search filter
            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate titleMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")), searchPattern);
                Predicate descriptionMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), searchPattern);
                Predicate notesMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("notes")), searchPattern);
                
                predicates.add(criteriaBuilder.or(titleMatch, descriptionMatch, notesMatch));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Statistics class for action items
     */
    public static class ActionItemStatistics {
        private final long total;
        private final long completed;
        private final long overdue;
        private final long dueSoon;
        private final long inProgress;

        public ActionItemStatistics(long total, long completed, long overdue, long dueSoon, long inProgress) {
            this.total = total;
            this.completed = completed;
            this.overdue = overdue;
            this.dueSoon = dueSoon;
            this.inProgress = inProgress;
        }

        // Getters
        public long getTotal() { return total; }
        public long getCompleted() { return completed; }
        public long getOverdue() { return overdue; }
        public long getDueSoon() { return dueSoon; }
        public long getInProgress() { return inProgress; }
        public double getCompletionRate() { 
            return total > 0 ? (double) completed / total * 100 : 0; 
        }
    }
}