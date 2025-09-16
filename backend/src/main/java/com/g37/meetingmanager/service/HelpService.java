package com.g37.meetingmanager.service;

import com.g37.meetingmanager.dto.HelpArticleDTO;
import com.g37.meetingmanager.dto.HelpFAQDTO;
import com.g37.meetingmanager.dto.SearchResultDTO;
import com.g37.meetingmanager.dto.SupportTicketDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Service interface for Help Center functionality
 */
public interface HelpService {
    
    // ===============================
    // Help Articles
    // ===============================
    
    /**
     * Get all help articles with pagination
     */
    List<HelpArticleDTO> getAllArticles(Pageable pageable);
    
    /**
     * Get help articles by category
     */
    List<HelpArticleDTO> getArticlesByCategory(String category, Pageable pageable);
    
    /**
     * Get a specific help article by ID
     */
    HelpArticleDTO getArticleById(Long id);
    
    /**
     * Create a new help article
     */
    HelpArticleDTO createArticle(HelpArticleDTO articleDTO, Long createdBy);
    
    /**
     * Create a new help article (admin version)
     */
    HelpArticleDTO createArticle(HelpArticleDTO articleDTO);
    
    /**
     * Update an existing help article
     */
    HelpArticleDTO updateArticle(Long id, HelpArticleDTO articleDTO, Long updatedBy);
    
    /**
     * Update an existing help article (admin version)
     */
    HelpArticleDTO updateArticle(Long id, HelpArticleDTO articleDTO);
    
    // ===============================
    // Admin-specific Article Methods
    // ===============================
    
    /**
     * Get all articles for admin with filtering and publish status
     */
    Page<HelpArticleDTO> getAllArticlesForAdmin(Pageable pageable, String category, Boolean isPublished);
    
    /**
     * Publish an article
     */
    HelpArticleDTO publishArticle(Long id);
    
    /**
     * Unpublish an article
     */
    HelpArticleDTO unpublishArticle(Long id);
    
    /**
     * Delete a help article
     */
    boolean deleteArticle(Long id);
    
    /**
     * Increment view count for an article
     */
    void incrementArticleViewCount(Long id);
    
    // ===============================
    // FAQs
    // ===============================
    
    /**
     * Get all FAQs with pagination
     */
    List<HelpFAQDTO> getAllFAQs(Pageable pageable);
    
    /**
     * Get FAQs by category
     */
    List<HelpFAQDTO> getFAQsByCategory(String category, Pageable pageable);
    
    /**
     * Get a specific FAQ by ID
     */
    HelpFAQDTO getFAQById(Long id);
    
    /**
     * Create a new FAQ
     */
    HelpFAQDTO createFAQ(HelpFAQDTO faqDTO, Long createdBy);
    
    /**
     * Create a new FAQ (admin version)
     */
    HelpFAQDTO createFAQ(HelpFAQDTO faqDTO);
    
    /**
     * Update an existing FAQ
     */
    HelpFAQDTO updateFAQ(Long id, HelpFAQDTO faqDTO, Long updatedBy);
    
    /**
     * Update an existing FAQ (admin version)
     */
    HelpFAQDTO updateFAQ(Long id, HelpFAQDTO faqDTO);
    
    // ===============================
    // Admin-specific FAQ Methods
    // ===============================
    
    /**
     * Get all FAQs for admin with filtering
     */
    Page<HelpFAQDTO> getAllFAQsForAdmin(Pageable pageable, String category, Boolean isActive);
    
    /**
     * Delete a FAQ
     */
    boolean deleteFAQ(Long id);
    
    /**
     * Increment view count for a FAQ
     */
    void incrementFAQViewCount(Long id);
    
    /**
     * Mark FAQ as helpful
     */
    boolean markFAQAsHelpful(Long id);
    
    /**
     * Mark FAQ as not helpful
     */
    boolean markFAQAsNotHelpful(Long id);
    
    // ===============================
    // Search
    // ===============================
    
    /**
     * Search across help articles and FAQs
     */
    List<SearchResultDTO> searchContent(String query, Pageable pageable);
    
    // ===============================
    // Support Tickets
    // ===============================
    
    /**
     * Submit a new support ticket
     */
    SupportTicketDTO submitSupportTicket(SupportTicketDTO ticketDTO, Long submittedBy);
    
    /**
     * Get support tickets for a specific user
     */
    List<SupportTicketDTO> getUserSupportTickets(Long userId, Pageable pageable);
    
    /**
     * Get a support ticket by ticket number (for the user who submitted it)
     */
    SupportTicketDTO getSupportTicketByNumber(String ticketNumber, Long userId);
    
    /**
     * Get all support tickets (admin only)
     */
    Page<SupportTicketDTO> getAllSupportTickets(String status, String priority, String category, Pageable pageable);
    
    // ===============================
    // Admin Support Ticket Methods
    // ===============================
    
    /**
     * Get all tickets for admin with filtering
     */
    Page<SupportTicketDTO> getAllTickets(Pageable pageable, String status, String priority);
    
    /**
     * Update a support ticket (admin)
     */
    SupportTicketDTO updateTicket(Long id, SupportTicketDTO ticketDTO);
    
    /**
     * Respond to a support ticket
     */
    SupportTicketDTO respondToTicket(Long id, String response);
    
    // ===============================
    // File Upload and Import
    // ===============================
    
    /**
     * Upload file for help content
     */
    String uploadFile(MultipartFile file);
    
    /**
     * Import articles from file
     */
    Map<String, Object> importArticles(MultipartFile file);
    
    /**
     * Import FAQs from file
     */
    Map<String, Object> importFAQs(MultipartFile file);
    
    // ===============================
    // Analytics and Reporting
    // ===============================
    
    /**
     * Get help analytics data
     */
    Map<String, Object> getHelpAnalytics(String period, String type);
    
    /**
     * Get most popular articles
     */
    List<HelpArticleDTO> getPopularArticles(int limit);
    
    /**
     * Get popular search terms
     */
    Map<String, Long> getPopularSearchTerms(int limit);
    
    /**
     * Update support ticket status (admin only)
     */
    SupportTicketDTO updateTicketStatus(String ticketNumber, String status, Long updatedBy, String notes);
    
    /**
     * Assign support ticket to a user (admin only)
     */
    SupportTicketDTO assignTicket(String ticketNumber, Long assignedTo, Long assignedBy);
    
    // ===============================
    // Categories and Statistics
    // ===============================
    
    /**
     * Get all help article categories
     */
    List<String> getHelpCategories();
    
    /**
     * Get all FAQ categories
     */
    List<String> getFAQCategories();
    
    /**
     * Get help system statistics
     */
    Map<String, Object> getHelpStatistics();
}