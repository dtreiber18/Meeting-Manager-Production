package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.PendingAction;
import com.g37.meetingmanager.service.PendingActionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Pending Actions", description = "Endpoints for managing pending actions and approval workflow")
@Validated
public class PendingActionController {

    @Autowired
    private PendingActionService pendingActionService;

    @Operation(summary = "Get all pending actions for a meeting", 
               description = "Retrieves all pending actions associated with a specific meeting")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending actions retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions"),
        @ApiResponse(responseCode = "404", description = "Meeting not found")
    })
    @GetMapping("/meeting/{meetingId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getPendingActionsByMeeting(
            @Parameter(description = "Meeting ID", required = true)
            @PathVariable @NotNull Long meetingId) {
        
        List<PendingAction> actions = pendingActionService.getPendingActionsByMeeting(meetingId);
        return ResponseEntity.ok(actions);
    }

    @Operation(summary = "Get pending action by ID", 
               description = "Retrieves a specific pending action by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending action found"),
        @ApiResponse(responseCode = "404", description = "Pending action not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingAction> getPendingActionById(
            @Parameter(description = "Pending action ID", required = true)
            @PathVariable @NotBlank String id) {
        
        Optional<PendingAction> action = pendingActionService.getPendingActionById(id);
        return action.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get pending actions assigned to user", 
               description = "Retrieves all pending actions assigned to a specific user")
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getPendingActionsByAssignee(
            @Parameter(description = "User ID", required = true)
            @PathVariable @NotNull Long userId) {
        
        List<PendingAction> actions = pendingActionService.getPendingActionsByAssignee(userId);
        return ResponseEntity.ok(actions);
    }

    @Operation(summary = "Get pending actions by status", 
               description = "Retrieves all pending actions filtered by status")
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getPendingActionsByStatus(
            @Parameter(description = "Action status", required = true)
            @PathVariable PendingAction.ActionStatus status) {
        
        List<PendingAction> actions = pendingActionService.getPendingActionsByStatus(status);
        return ResponseEntity.ok(actions);
    }

    @Operation(summary = "Get overdue pending actions", 
               description = "Retrieves all pending actions that are past their due date")
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getOverduePendingActions() {
        List<PendingAction> actions = pendingActionService.getOverduePendingActions();
        return ResponseEntity.ok(actions);
    }

    @Operation(summary = "Get pending actions due soon", 
               description = "Retrieves all pending actions due within the specified number of days")
    @GetMapping("/due-soon")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> getPendingActionsDueSoon(
            @Parameter(description = "Number of days to look ahead")
            @RequestParam(defaultValue = "7") int days) {
        
        List<PendingAction> actions = pendingActionService.getPendingActionsDueSoon(days);
        return ResponseEntity.ok(actions);
    }

    @Operation(summary = "Create a new pending action", 
               description = "Creates a new pending action for approval workflow")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Pending action created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingAction> createPendingAction(
            @Parameter(description = "Pending action details", required = true)
            @Valid @RequestBody PendingAction pendingAction) {
        
        PendingAction createdAction = pendingActionService.createPendingAction(pendingAction);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAction);
    }

    @Operation(summary = "Update a pending action", 
               description = "Updates an existing pending action")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending action updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Pending action not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingAction> updatePendingAction(
            @Parameter(description = "Pending action ID", required = true)
            @PathVariable @NotBlank String id,
            @Parameter(description = "Updated pending action details", required = true)
            @Valid @RequestBody PendingAction actionDetails) {
        
        try {
            PendingAction updatedAction = pendingActionService.updatePendingAction(id, actionDetails);
            return ResponseEntity.ok(updatedAction);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Approve a pending action", 
               description = "Approves a pending action and triggers workflow")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending action approved successfully"),
        @ApiResponse(responseCode = "404", description = "Pending action not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions for approval")
    })
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<PendingAction> approvePendingAction(
            @Parameter(description = "Pending action ID", required = true)
            @PathVariable @NotBlank String id,
            @Parameter(description = "User ID performing the approval", required = true)
            @RequestParam @NotNull Long approvedById,
            @Parameter(description = "Optional approval notes")
            @RequestParam(required = false) String notes) {
        
        try {
            PendingAction approvedAction = pendingActionService.approvePendingAction(id, approvedById, notes);
            return ResponseEntity.ok(approvedAction);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Reject a pending action", 
               description = "Rejects a pending action with optional notes")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pending action rejected successfully"),
        @ApiResponse(responseCode = "404", description = "Pending action not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions for rejection")
    })
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<PendingAction> rejectPendingAction(
            @Parameter(description = "Pending action ID", required = true)
            @PathVariable @NotBlank String id,
            @Parameter(description = "User ID performing the rejection", required = true)
            @RequestParam @NotNull Long rejectedById,
            @Parameter(description = "Optional rejection notes")
            @RequestParam(required = false) String notes) {
        
        try {
            PendingAction rejectedAction = pendingActionService.rejectPendingAction(id, rejectedById, notes);
            return ResponseEntity.ok(rejectedAction);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Mark pending action as completed", 
               description = "Marks a pending action as completed")
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingAction> completePendingAction(
            @Parameter(description = "Pending action ID", required = true)
            @PathVariable @NotBlank String id,
            @Parameter(description = "Optional completion notes")
            @RequestParam(required = false) String completionNotes) {
        
        try {
            PendingAction completedAction = pendingActionService.completePendingAction(id, completionNotes);
            return ResponseEntity.ok(completedAction);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Delete a pending action", 
               description = "Deletes a pending action permanently")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Pending action deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Pending action not found"),
        @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Void> deletePendingAction(
            @Parameter(description = "Pending action ID", required = true)
            @PathVariable @NotBlank String id) {
        
        try {
            pendingActionService.deletePendingAction(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get pending actions with pagination", 
               description = "Retrieves pending actions with pagination and filtering")
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<PendingAction>> getPendingActions(
            @Parameter(description = "User ID for filtering")
            @RequestParam(required = false) Long userId,
            @Parameter(description = "Organization ID for filtering")
            @RequestParam(required = false) Long organizationId,
            @Parameter(description = "Status filters")
            @RequestParam(required = false) List<PendingAction.ActionStatus> statuses,
            Pageable pageable) {
        
        Page<PendingAction> actions = pendingActionService.getPendingActions(
            userId, organizationId, statuses, pageable);
        return ResponseEntity.ok(actions);
    }

    @Operation(summary = "Search pending actions", 
               description = "Searches pending actions by text content")
    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> searchPendingActions(
            @Parameter(description = "Search text", required = true)
            @RequestParam @NotBlank String searchText,
            @Parameter(description = "Organization ID for filtering")
            @RequestParam(required = false) Long organizationId) {
        
        List<PendingAction> actions = pendingActionService.searchPendingActions(searchText, organizationId);
        return ResponseEntity.ok(actions);
    }

    @Operation(summary = "Get pending action statistics", 
               description = "Retrieves statistics for pending actions by user")
    @GetMapping("/statistics/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PendingActionService.PendingActionStatistics> getStatistics(
            @Parameter(description = "User ID", required = true)
            @PathVariable @NotNull Long userId) {
        
        PendingActionService.PendingActionStatistics stats = pendingActionService.getStatistics(userId);
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Bulk approve pending actions", 
               description = "Approves multiple pending actions at once")
    @PostMapping("/bulk-approve")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<PendingAction>> bulkApprovePendingActions(
            @Parameter(description = "List of pending action IDs", required = true)
            @RequestBody @NotNull List<String> ids,
            @Parameter(description = "User ID performing the approval", required = true)
            @RequestParam @NotNull Long approvedById,
            @Parameter(description = "Optional approval notes")
            @RequestParam(required = false) String notes) {
        
        List<PendingAction> approvedActions = pendingActionService.bulkApprovePendingActions(ids, approvedById, notes);
        return ResponseEntity.ok(approvedActions);
    }

    @Operation(summary = "Bulk reject pending actions", 
               description = "Rejects multiple pending actions at once")
    @PostMapping("/bulk-reject")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<PendingAction>> bulkRejectPendingActions(
            @Parameter(description = "List of pending action IDs", required = true)
            @RequestBody @NotNull List<String> ids,
            @Parameter(description = "User ID performing the rejection", required = true)
            @RequestParam @NotNull Long rejectedById,
            @Parameter(description = "Optional rejection notes")
            @RequestParam(required = false) String notes) {
        
        List<PendingAction> rejectedActions = pendingActionService.bulkRejectPendingActions(ids, rejectedById, notes);
        return ResponseEntity.ok(rejectedActions);
    }

    @Operation(summary = "Convert meeting action items to pending actions", 
               description = "Creates pending actions from existing meeting action items")
    @PostMapping("/from-meeting/{meetingId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PendingAction>> createPendingActionsFromMeeting(
            @Parameter(description = "Meeting ID", required = true)
            @PathVariable @NotNull Long meetingId,
            @Parameter(description = "Reporter user ID", required = true)
            @RequestParam @NotNull Long reporterId) {
        
        try {
            List<PendingAction> pendingActions = pendingActionService.createPendingActionsFromMeeting(meetingId, reporterId);
            return ResponseEntity.status(HttpStatus.CREATED).body(pendingActions);
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
        }
    }
}