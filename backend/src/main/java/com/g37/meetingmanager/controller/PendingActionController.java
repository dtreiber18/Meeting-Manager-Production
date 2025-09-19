package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.PendingAction;
import com.g37.meetingmanager.service.PendingActionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pending-actions")
@Validated
public class PendingActionController {

    @Autowired
    private PendingActionService pendingActionService;

    /**
     * Get all pending actions for a meeting
     * Retrieves all pending actions associated with a specific meeting
     */
    @GetMapping("/meeting/{meetingId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getPendingActionsByMeeting(
            @PathVariable @NotNull Long meetingId) {
        
        List<PendingAction> actions = pendingActionService.getPendingActionsByMeeting(meetingId);
        return ResponseEntity.ok(actions);
    }

    /**
     * Get pending action by ID
     * Retrieves a specific pending action by its ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingAction> getPendingActionById(
            @PathVariable @NotBlank String id) {
        
        Optional<PendingAction> action = pendingActionService.getPendingActionById(id);
        return action.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get pending actions assigned to user
     * Retrieves all pending actions assigned to a specific user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getPendingActionsByAssignee(
            @PathVariable @NotNull Long userId) {
        
        List<PendingAction> actions = pendingActionService.getPendingActionsByAssignee(userId);
        return ResponseEntity.ok(actions);
    }

    /**
     * Get pending actions by status
     * Retrieves all pending actions filtered by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getPendingActionsByStatus(
            @PathVariable PendingAction.ActionStatus status) {
        
        List<PendingAction> actions = pendingActionService.getPendingActionsByStatus(status);
        return ResponseEntity.ok(actions);
    }

    /**
     * Get overdue pending actions
     * Retrieves all pending actions that are past their due date
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getOverduePendingActions() {
        List<PendingAction> actions = pendingActionService.getOverduePendingActions();
        return ResponseEntity.ok(actions);
    }

    /**
     * Get pending actions due soon
     * Retrieves all pending actions due within the specified number of days
     */
    @GetMapping("/due-soon")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getPendingActionsDueSoon(
            @RequestParam(defaultValue = "7") int days) {
        
        List<PendingAction> actions = pendingActionService.getPendingActionsDueSoon(days);
        return ResponseEntity.ok(actions);
    }

    /**
     * Create a new pending action
     * Creates a new pending action for approval workflow
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingAction> createPendingAction(
            @Valid @RequestBody PendingAction pendingAction) {
        
        PendingAction createdAction = pendingActionService.createPendingAction(pendingAction);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAction);
    }

    /**
     * Update a pending action
     * Updates an existing pending action
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingAction> updatePendingAction(
            @PathVariable @NotBlank String id,
            @Valid @RequestBody PendingAction actionDetails) {
        
        try {
            PendingAction updatedAction = pendingActionService.updatePendingAction(id, actionDetails);
            return ResponseEntity.ok(updatedAction);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Approve a pending action
     * Approves a pending action and triggers workflow
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<PendingAction> approvePendingAction(
            @PathVariable @NotBlank String id,
            @RequestParam @NotNull Long approvedById,
            @RequestParam(required = false) String notes) {
        
        try {
            PendingAction approvedAction = pendingActionService.approvePendingAction(id, approvedById, notes);
            return ResponseEntity.ok(approvedAction);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Reject a pending action
     * Rejects a pending action with optional notes
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<PendingAction> rejectPendingAction(
            @PathVariable @NotBlank String id,
            @RequestParam @NotNull Long rejectedById,
            @RequestParam(required = false) String notes) {
        
        try {
            PendingAction rejectedAction = pendingActionService.rejectPendingAction(id, rejectedById, notes);
            return ResponseEntity.ok(rejectedAction);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mark pending action as completed
     * Marks a pending action as completed
     */
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingAction> completePendingAction(
            @PathVariable @NotBlank String id,
            @RequestParam(required = false) String completionNotes) {
        
        try {
            PendingAction completedAction = pendingActionService.completePendingAction(id, completionNotes);
            return ResponseEntity.ok(completedAction);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a pending action
     * Deletes a pending action permanently
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> deletePendingAction(
            @PathVariable @NotBlank String id) {
        
        try {
            pendingActionService.deletePendingAction(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get pending actions with pagination
     * Retrieves pending actions with pagination and filtering
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<PendingAction>> getPendingActions(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long organizationId,
            @RequestParam(required = false) List<PendingAction.ActionStatus> statuses,
            Pageable pageable) {
        
        Page<PendingAction> actions = pendingActionService.getPendingActions(
            userId, organizationId, statuses, pageable);
        return ResponseEntity.ok(actions);
    }

    /**
     * Search pending actions
     * Searches pending actions by text content
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> searchPendingActions(
            @RequestParam @NotBlank String searchText,
            @RequestParam(required = false) Long organizationId) {
        
        List<PendingAction> actions = pendingActionService.searchPendingActions(searchText, organizationId);
        return ResponseEntity.ok(actions);
    }

    /**
     * Get pending action statistics
     * Retrieves statistics for pending actions by user
     */
    @GetMapping("/statistics/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingActionService.PendingActionStatistics> getStatistics(
            @PathVariable @NotNull Long userId) {
        
        PendingActionService.PendingActionStatistics stats = pendingActionService.getStatistics(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Bulk approve pending actions
     * Approves multiple pending actions at once
     */
    @PostMapping("/bulk-approve")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<PendingAction>> bulkApprovePendingActions(
            @RequestBody @NotNull List<String> ids,
            @RequestParam @NotNull Long approvedById,
            @RequestParam(required = false) String notes) {
        
        List<PendingAction> approvedActions = pendingActionService.bulkApprovePendingActions(ids, approvedById, notes);
        return ResponseEntity.ok(approvedActions);
    }

    /**
     * Bulk reject pending actions
     * Rejects multiple pending actions at once
     */
    @PostMapping("/bulk-reject")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<PendingAction>> bulkRejectPendingActions(
            @RequestBody @NotNull List<String> ids,
            @RequestParam @NotNull Long rejectedById,
            @RequestParam(required = false) String notes) {
        
        List<PendingAction> rejectedActions = pendingActionService.bulkRejectPendingActions(ids, rejectedById, notes);
        return ResponseEntity.ok(rejectedActions);
    }

    /**
     * Convert meeting action items to pending actions
     * Creates pending actions from existing meeting action items
     */
    @PostMapping("/from-meeting/{meetingId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> createPendingActionsFromMeeting(
            @PathVariable @NotNull Long meetingId,
            @RequestParam @NotNull Long reporterId) {
        
        try {
            List<PendingAction> pendingActions = pendingActionService.createPendingActionsFromMeeting(meetingId, reporterId);
            return ResponseEntity.status(HttpStatus.CREATED).body(pendingActions);
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
        }
    }
}