package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.ActionItem;
import com.g37.meetingmanager.service.ActionItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/action-items")
@CrossOrigin(origins = {"http://localhost:4200", "https://localhost:4200"})
public class ActionItemController {

    @Autowired
    private ActionItemService actionItemService;

    /**
     * Get all action items with filtering and pagination
     */
    @GetMapping
    public ResponseEntity<Page<ActionItem>> getAllActionItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Boolean overdue,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String search) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<ActionItem> actionItems = actionItemService.getAllActionItems(
                status, priority, assigneeId, overdue, completed, search, pageable);
            
            return ResponseEntity.ok(actionItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get action item by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ActionItem> getActionItemById(@PathVariable Long id) {
        try {
            return actionItemService.getActionItemById(id)
                    .map(actionItem -> ResponseEntity.ok(actionItem))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get action items assigned to a specific user
     */
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<Page<ActionItem>> getActionItemsByAssignee(
            @PathVariable Long assigneeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<ActionItem> actionItems = actionItemService.getActionItemsByAssignee(assigneeId, pageable);
            
            return ResponseEntity.ok(actionItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get action items reported by a specific user
     */
    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<Page<ActionItem>> getActionItemsByReporter(
            @PathVariable Long reporterId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            Page<ActionItem> actionItems = actionItemService.getActionItemsByReporter(reporterId, pageable);
            
            return ResponseEntity.ok(actionItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get overdue action items
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<ActionItem>> getOverdueActionItems() {
        try {
            List<ActionItem> overdueItems = actionItemService.getOverdueActionItems();
            return ResponseEntity.ok(overdueItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get action items due soon
     */
    @GetMapping("/due-soon")
    public ResponseEntity<List<ActionItem>> getActionItemsDueSoon(
            @RequestParam(defaultValue = "7") int days) {
        try {
            List<ActionItem> dueSoonItems = actionItemService.getActionItemsDueSoon(days);
            return ResponseEntity.ok(dueSoonItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get action item statistics for a user
     */
    @GetMapping("/statistics/{userId}")
    public ResponseEntity<ActionItemService.ActionItemStatistics> getStatistics(@PathVariable Long userId) {
        try {
            ActionItemService.ActionItemStatistics stats = actionItemService.getStatistics(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Create a new action item
     */
    @PostMapping
    public ResponseEntity<ActionItem> createActionItem(
            @Valid @RequestBody ActionItem actionItem,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long reporterId) {
        try {
            ActionItem createdActionItem = actionItemService.createActionItem(actionItem, assigneeId, reporterId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdActionItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Update an existing action item
     */
    @PutMapping("/{id}")
    public ResponseEntity<ActionItem> updateActionItem(
            @PathVariable Long id,
            @Valid @RequestBody ActionItem actionItemDetails) {
        try {
            ActionItem updatedActionItem = actionItemService.updateActionItem(id, actionItemDetails);
            return ResponseEntity.ok(updatedActionItem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Mark action item as completed
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ActionItem> markAsCompleted(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String completionNotes = request != null ? request.get("completionNotes") : null;
            ActionItem completedActionItem = actionItemService.markAsCompleted(id, completionNotes);
            return ResponseEntity.ok(completedActionItem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Mark action item as in progress
     */
    @PatchMapping("/{id}/in-progress")
    public ResponseEntity<ActionItem> markAsInProgress(@PathVariable Long id) {
        try {
            ActionItem actionItem = actionItemService.markAsInProgress(id);
            return ResponseEntity.ok(actionItem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Delete an action item
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActionItem(@PathVariable Long id) {
        try {
            actionItemService.deleteActionItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add a subtask to an action item
     */
    @PostMapping("/{id}/subtasks")
    public ResponseEntity<ActionItem> addSubTask(
            @PathVariable Long id,
            @Valid @RequestBody ActionItem subTask,
            @RequestParam(required = false) Long assigneeId) {
        try {
            ActionItem parentWithSubTask = actionItemService.addSubTask(id, subTask, assigneeId);
            return ResponseEntity.status(HttpStatus.CREATED).body(parentWithSubTask);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Search action items
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ActionItem>> searchActionItems(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<ActionItem> actionItems = actionItemService.getAllActionItems(
                null, null, null, null, null, q, pageable);
            
            return ResponseEntity.ok(actionItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get action items by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<ActionItem>> getActionItemsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<ActionItem> actionItems = actionItemService.getAllActionItems(
                status, null, null, null, null, null, pageable);
            
            return ResponseEntity.ok(actionItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get action items by priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<Page<ActionItem>> getActionItemsByPriority(
            @PathVariable String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dueDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<ActionItem> actionItems = actionItemService.getAllActionItems(
                null, priority, null, null, null, null, pageable);
            
            return ResponseEntity.ok(actionItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}