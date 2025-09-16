package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.dto.HelpArticleDTO;
import com.g37.meetingmanager.dto.HelpFAQDTO;
import com.g37.meetingmanager.dto.SupportTicketDTO;
import com.g37.meetingmanager.service.HelpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/help")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN') or hasRole('HELP_ADMIN')")
public class HelpAdminController {

    @Autowired
    private HelpService helpService;

    // Article Management
    @PostMapping("/articles")
    public ResponseEntity<HelpArticleDTO> createArticle(@Valid @RequestBody HelpArticleDTO articleDTO) {
        try {
            HelpArticleDTO createdArticle = helpService.createArticle(articleDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdArticle);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<HelpArticleDTO> updateArticle(
            @PathVariable Long id, 
            @Valid @RequestBody HelpArticleDTO articleDTO) {
        try {
            HelpArticleDTO updatedArticle = helpService.updateArticle(id, articleDTO);
            return ResponseEntity.ok(updatedArticle);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/articles/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        try {
            helpService.deleteArticle(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/articles")
    public ResponseEntity<Page<HelpArticleDTO>> getAllArticlesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean published) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HelpArticleDTO> articles = helpService.getAllArticlesForAdmin(pageable, category, published);
        return ResponseEntity.ok(articles);
    }

    @PostMapping("/articles/{id}/publish")
    public ResponseEntity<HelpArticleDTO> publishArticle(@PathVariable Long id) {
        try {
            HelpArticleDTO article = helpService.publishArticle(id);
            return ResponseEntity.ok(article);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/articles/{id}/unpublish")
    public ResponseEntity<HelpArticleDTO> unpublishArticle(@PathVariable Long id) {
        try {
            HelpArticleDTO article = helpService.unpublishArticle(id);
            return ResponseEntity.ok(article);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // FAQ Management
    @PostMapping("/faqs")
    public ResponseEntity<HelpFAQDTO> createFAQ(@Valid @RequestBody HelpFAQDTO faqDTO) {
        try {
            HelpFAQDTO createdFAQ = helpService.createFAQ(faqDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFAQ);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/faqs/{id}")
    public ResponseEntity<HelpFAQDTO> updateFAQ(
            @PathVariable Long id, 
            @Valid @RequestBody HelpFAQDTO faqDTO) {
        try {
            HelpFAQDTO updatedFAQ = helpService.updateFAQ(id, faqDTO);
            return ResponseEntity.ok(updatedFAQ);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/faqs/{id}")
    public ResponseEntity<Void> deleteFAQ(@PathVariable Long id) {
        try {
            helpService.deleteFAQ(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/faqs")
    public ResponseEntity<Page<HelpFAQDTO>> getAllFAQsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean published) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HelpFAQDTO> faqs = helpService.getAllFAQsForAdmin(pageable, category, published);
        return ResponseEntity.ok(faqs);
    }

    // File Upload for Articles
    @PostMapping("/articles/upload")
    public ResponseEntity<Map<String, String>> uploadArticleFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = helpService.uploadFile(file);
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    // Bulk Import
    @PostMapping("/articles/import")
    public ResponseEntity<Map<String, Object>> importArticles(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = helpService.importArticles(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Import failed: " + e.getMessage()));
        }
    }

    @PostMapping("/faqs/import")
    public ResponseEntity<Map<String, Object>> importFAQs(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = helpService.importFAQs(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Import failed: " + e.getMessage()));
        }
    }

    // Support Ticket Management
    @GetMapping("/tickets")
    public ResponseEntity<Page<SupportTicketDTO>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<SupportTicketDTO> tickets = helpService.getAllTickets(pageable, status, priority);
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/tickets/{id}")
    public ResponseEntity<SupportTicketDTO> updateTicket(
            @PathVariable Long id, 
            @Valid @RequestBody SupportTicketDTO ticketDTO) {
        try {
            SupportTicketDTO updatedTicket = helpService.updateTicket(id, ticketDTO);
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/tickets/{id}/respond")
    public ResponseEntity<SupportTicketDTO> respondToTicket(
            @PathVariable Long id, 
            @RequestBody Map<String, String> response) {
        try {
            String responseText = response.get("response");
            SupportTicketDTO ticket = helpService.respondToTicket(id, responseText);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Analytics
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getHelpAnalytics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        Map<String, Object> analytics = helpService.getHelpAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/popular-articles")
    public ResponseEntity<List<HelpArticleDTO>> getPopularArticles(
            @RequestParam(defaultValue = "10") int limit) {
        List<HelpArticleDTO> articles = helpService.getPopularArticles(limit);
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/analytics/search-terms")
    public ResponseEntity<Map<String, Object>> getPopularSearchTerms(
            @RequestParam(defaultValue = "20") int limit) {
        Map<String, Long> searchTerms = helpService.getPopularSearchTerms(limit);
        Map<String, Object> response = new HashMap<>(searchTerms);
        return ResponseEntity.ok(response);
    }
}