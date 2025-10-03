package com.g37.meetingmanager.service.impl;

import com.g37.meetingmanager.dto.*;
import com.g37.meetingmanager.model.*;
import com.g37.meetingmanager.repository.mysql.*;
import com.g37.meetingmanager.service.CloudStorageService;
import com.g37.meetingmanager.service.HelpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@Service
@Transactional
public class HelpServiceImpl implements HelpService {

    private static final Logger logger = LoggerFactory.getLogger(HelpServiceImpl.class);

    private final HelpArticleRepository articleRepository;
    private final HelpFAQRepository faqRepository;
    private final SupportTicketRepository ticketRepository;
    private final CloudStorageService cloudStorageService;
    private final DocumentRepository documentRepository;

    @Value("${help.default.storage.provider:ONEDRIVE}")
    private String defaultStorageProvider;

    public HelpServiceImpl(HelpArticleRepository articleRepository,
                          HelpFAQRepository faqRepository,
                          SupportTicketRepository ticketRepository,
                          CloudStorageService cloudStorageService,
                          DocumentRepository documentRepository) {
        this.articleRepository = articleRepository;
        this.faqRepository = faqRepository;
        this.ticketRepository = ticketRepository;
        this.cloudStorageService = cloudStorageService;
        this.documentRepository = documentRepository;
    }

    // ===============================
    // Help Articles
    // ===============================

    @Override
    public List<HelpArticleDTO> getAllArticles(Pageable pageable) {
        return articleRepository.findByIsPublishedTrueOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .map(this::convertToArticleDTO)
                .toList();
    }

    @Override
    public List<HelpArticleDTO> getArticlesByCategory(String category, Pageable pageable) {
        return articleRepository.findByCategoryAndIsPublishedTrueOrderBySortOrderAscCreatedAtDesc(category)
                .stream()
                .map(this::convertToArticleDTO)
                .toList();
    }

    @Override
    public HelpArticleDTO getArticleById(Long id) {
        Optional<HelpArticle> article = articleRepository.findByIdAndIsPublishedTrue(id);
        return article.map(this::convertToArticleDTO).orElse(null);
    }

    @Override
    public HelpArticleDTO createArticle(HelpArticleDTO articleDTO, Long createdBy) {
        HelpArticle article = convertToArticleEntity(articleDTO);
        article.setCreatedBy(createdBy);
        article = articleRepository.save(article);
        return convertToArticleDTO(article);
    }

    @Override
    public HelpArticleDTO updateArticle(Long id, HelpArticleDTO articleDTO, Long updatedBy) {
        HelpArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        updateArticleFromDTO(article, articleDTO);
        article.setUpdatedBy(updatedBy);
        article = articleRepository.save(article);
        return convertToArticleDTO(article);
    }

    @Override
    public boolean deleteArticle(Long id) {
        if (articleRepository.existsById(id)) {
            articleRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public void incrementArticleViewCount(Long id) {
        articleRepository.incrementViewCount(id);
    }

    // ===============================
    // FAQs
    // ===============================

    @Override
    public List<HelpFAQDTO> getAllFAQs(Pageable pageable) {
        return faqRepository.findByIsPublishedTrueOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .map(this::convertToFAQDTO)
                .toList();
    }

    @Override
    public List<HelpFAQDTO> getFAQsByCategory(String category, Pageable pageable) {
        return faqRepository.findByCategoryAndIsPublishedTrueOrderBySortOrderAscCreatedAtDesc(category)
                .stream()
                .map(this::convertToFAQDTO)
                .toList();
    }

    @Override
    public HelpFAQDTO getFAQById(Long id) {
        Optional<HelpFAQ> faq = faqRepository.findByIdAndIsPublishedTrue(id);
        return faq.map(this::convertToFAQDTO).orElse(null);
    }

    @Override
    public HelpFAQDTO createFAQ(HelpFAQDTO faqDTO, Long createdBy) {
        HelpFAQ faq = convertToFAQEntity(faqDTO);
        faq.setCreatedBy(createdBy);
        faq = faqRepository.save(faq);
        return convertToFAQDTO(faq);
    }

    @Override
    public HelpFAQDTO updateFAQ(Long id, HelpFAQDTO faqDTO, Long updatedBy) {
        HelpFAQ faq = faqRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FAQ not found"));
        
        updateFAQFromDTO(faq, faqDTO);
        faq.setUpdatedBy(updatedBy);
        faq = faqRepository.save(faq);
        return convertToFAQDTO(faq);
    }

    @Override
    public boolean deleteFAQ(Long id) {
        if (faqRepository.existsById(id)) {
            faqRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public void incrementFAQViewCount(Long id) {
        faqRepository.incrementViewCount(id);
    }

    @Override
    public boolean markFAQAsHelpful(Long id) {
        try {
            faqRepository.incrementHelpfulCount(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean markFAQAsNotHelpful(Long id) {
        try {
            faqRepository.incrementNotHelpfulCount(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // ===============================
    // Search
    // ===============================

    @Override
    public List<SearchResultDTO> searchContent(String query, Pageable pageable) {
        List<SearchResultDTO> results = new java.util.ArrayList<>();
        
        // Search articles
        List<HelpArticle> articles = articleRepository.searchPublishedArticles(query);
        articles.forEach(article -> {
            SearchResultDTO result = new SearchResultDTO();
            result.setId(article.getId());
            result.setTitle(article.getTitle());
            result.setType("article");
            result.setSnippet(truncateContent(article.getContent(), 200));
            result.setCategory(article.getCategory());
            result.setUrl("/help/articles/" + article.getId());
            results.add(result);
        });
        
        // Search FAQs
        List<HelpFAQ> faqs = faqRepository.searchPublishedFAQs(query);
        faqs.forEach(faq -> {
            SearchResultDTO result = new SearchResultDTO();
            result.setId(faq.getId());
            result.setTitle(faq.getQuestion());
            result.setType("faq");
            result.setSnippet(truncateContent(faq.getAnswer(), 200));
            result.setCategory(faq.getCategory());
            result.setUrl("/help/faq/" + faq.getId());
            results.add(result);
        });
        
        return results;
    }

    // ===============================
    // Support Tickets
    // ===============================

    @Override
    public SupportTicketDTO submitSupportTicket(SupportTicketDTO ticketDTO, Long submittedBy) {
        SupportTicket ticket = convertToTicketEntity(ticketDTO);
        ticket.setSubmittedBy(submittedBy);
        ticket.setStatus(SupportTicket.Status.OPEN);
        ticket = ticketRepository.save(ticket);
        return convertToTicketDTO(ticket);
    }

    @Override
    public List<SupportTicketDTO> getUserSupportTickets(Long userId, Pageable pageable) {
        return ticketRepository.findBySubmittedByOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToTicketDTO)
                .toList();
    }

    @Override
    public SupportTicketDTO getSupportTicketByNumber(String ticketNumber, Long userId) {
        Optional<SupportTicket> ticket = ticketRepository.findByTicketNumber(ticketNumber);
        if (ticket.isPresent() && ticket.get().getSubmittedBy().equals(userId)) {
            return convertToTicketDTO(ticket.get());
        }
        return null;
    }

    @Override
    public Page<SupportTicketDTO> getAllSupportTickets(String status, String priority, String category, Pageable pageable) {
        // For now, return all tickets - add filtering later
        return ticketRepository.findAll(pageable).map(this::convertToTicketDTO);
    }

    @Override
    public SupportTicketDTO updateTicketStatus(String ticketNumber, String status, Long updatedBy, String notes) {
        Optional<SupportTicket> ticketOpt = ticketRepository.findByTicketNumber(ticketNumber);
        if (ticketOpt.isPresent()) {
            SupportTicket ticket = ticketOpt.get();
            ticket.setStatus(SupportTicket.Status.valueOf(status));
            if (notes != null && !notes.trim().isEmpty()) {
                // Add notes to existing notes or create new
                String existingNotes = ticket.getDescription();
                ticket.setDescription(existingNotes + "\n\nUpdate: " + notes);
            }
            ticket = ticketRepository.save(ticket);
            return convertToTicketDTO(ticket);
        }
        return null;
    }

    @Override
    public SupportTicketDTO assignTicket(String ticketNumber, Long assignedTo, Long assignedBy) {
        Optional<SupportTicket> ticketOpt = ticketRepository.findByTicketNumber(ticketNumber);
        if (ticketOpt.isPresent()) {
            SupportTicket ticket = ticketOpt.get();
            ticket.setAssignedTo(assignedTo);
            ticket = ticketRepository.save(ticket);
            return convertToTicketDTO(ticket);
        }
        return null;
    }

    // ===============================
    // Categories and Statistics
    // ===============================

    @Override
    public List<String> getHelpCategories() {
        return articleRepository.findDistinctCategoriesForPublished();
    }

    @Override
    public List<String> getFAQCategories() {
        return faqRepository.findDistinctCategoriesForPublished();
    }

    @Override
    public Map<String, Object> getHelpStatistics() {
        Map<String, Object> stats = new java.util.HashMap<>();
        
        // Article statistics
        stats.put("totalArticles", articleRepository.countByIsPublishedTrue());
        stats.put("totalFAQs", faqRepository.countByIsPublishedTrue());
        stats.put("totalTickets", ticketRepository.count());
        stats.put("openTickets", ticketRepository.countByStatus(SupportTicket.Status.OPEN));
        
        return stats;
    }

    // ===============================
    // Private Helper Methods
    // ===============================

    private HelpArticleDTO convertToArticleDTO(HelpArticle article) {
        HelpArticleDTO dto = new HelpArticleDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setDescription(article.getDescription());
        dto.setContent(article.getContent());
        dto.setCategory(article.getCategory());
        dto.setTags(article.getTags());
        dto.setViewCount(article.getViewCount());
        dto.setIsPublished(article.getIsPublished());
        dto.setSortOrder(article.getSortOrder());
        dto.setCreatedBy(article.getCreatedBy());
        dto.setUpdatedBy(article.getUpdatedBy());
        dto.setCreatedAt(article.getCreatedAt());
        dto.setUpdatedAt(article.getUpdatedAt());
        return dto;
    }

    private HelpArticle convertToArticleEntity(HelpArticleDTO dto) {
        HelpArticle article = new HelpArticle();
        updateArticleFromDTO(article, dto);
        return article;
    }

    private void updateArticleFromDTO(HelpArticle article, HelpArticleDTO dto) {
        article.setTitle(dto.getTitle());
        article.setDescription(dto.getDescription());
        article.setContent(dto.getContent());
        article.setCategory(dto.getCategory());
        article.setTags(dto.getTags());
        article.setIsPublished(dto.getIsPublished());
        article.setSortOrder(dto.getSortOrder());
    }

    private HelpFAQDTO convertToFAQDTO(HelpFAQ faq) {
        HelpFAQDTO dto = new HelpFAQDTO();
        dto.setId(faq.getId());
        dto.setQuestion(faq.getQuestion());
        dto.setAnswer(faq.getAnswer());
        dto.setCategory(faq.getCategory());
        dto.setTags(faq.getTags());
        dto.setViewCount(faq.getViewCount());
        dto.setHelpfulCount(faq.getHelpfulCount());
        dto.setNotHelpfulCount(faq.getNotHelpfulCount());
        dto.setIsPublished(faq.getIsPublished());
        dto.setSortOrder(faq.getSortOrder());
        dto.setCreatedBy(faq.getCreatedBy());
        dto.setUpdatedBy(faq.getUpdatedBy());
        dto.setCreatedAt(faq.getCreatedAt());
        dto.setUpdatedAt(faq.getUpdatedAt());
        return dto;
    }

    private HelpFAQ convertToFAQEntity(HelpFAQDTO dto) {
        HelpFAQ faq = new HelpFAQ();
        updateFAQFromDTO(faq, dto);
        return faq;
    }

    private void updateFAQFromDTO(HelpFAQ faq, HelpFAQDTO dto) {
        faq.setQuestion(dto.getQuestion());
        faq.setAnswer(dto.getAnswer());
        faq.setCategory(dto.getCategory());
        faq.setTags(dto.getTags());
        faq.setIsPublished(dto.getIsPublished());
        faq.setSortOrder(dto.getSortOrder());
    }

    private SupportTicketDTO convertToTicketDTO(SupportTicket ticket) {
        SupportTicketDTO dto = new SupportTicketDTO();
        dto.setId(ticket.getId());
        dto.setTicketNumber(ticket.getTicketNumber());
        dto.setSubject(ticket.getSubject());
        dto.setDescription(ticket.getDescription());
        dto.setCategory(ticket.getCategory().name());
        dto.setPriority(ticket.getPriority().name());
        dto.setStatus(ticket.getStatus().name());
        dto.setSubmittedBy(ticket.getSubmittedBy());
        dto.setAssignedTo(ticket.getAssignedTo());
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        dto.setResolvedAt(ticket.getResolvedAt());
        return dto;
    }

    private SupportTicket convertToTicketEntity(SupportTicketDTO dto) {
        SupportTicket ticket = new SupportTicket();
        ticket.setSubject(dto.getSubject());
        ticket.setDescription(dto.getDescription());
        if (dto.getCategory() != null) {
            ticket.setCategory(SupportTicket.Category.valueOf(dto.getCategory()));
        }
        if (dto.getPriority() != null) {
            ticket.setPriority(SupportTicket.Priority.valueOf(dto.getPriority()));
        }
        return ticket;
    }

    // ===============================
    // Admin Methods Implementation
    // ===============================

    @Override
    public HelpArticleDTO createArticle(HelpArticleDTO articleDTO) {
        // Use current user context or system user
        return createArticle(articleDTO, 1L); // TODO: Get current user from security context
    }

    @Override
    public HelpArticleDTO updateArticle(Long id, HelpArticleDTO articleDTO) {
        // Use current user context or system user
        return updateArticle(id, articleDTO, 1L); // TODO: Get current user from security context
    }

    @Override
    public Page<HelpArticleDTO> getAllArticlesForAdmin(Pageable pageable, String category, Boolean isPublished) {
        Page<HelpArticle> articles;
        
        if (category != null && isPublished != null) {
            articles = articleRepository.findByCategoryAndIsPublished(category, isPublished, pageable);
        } else if (category != null) {
            articles = articleRepository.findByCategory(category, pageable);
        } else if (isPublished != null) {
            articles = articleRepository.findByIsPublished(isPublished, pageable);
        } else {
            articles = articleRepository.findAll(pageable);
        }
        
        return articles.map(this::convertToArticleDTO);
    }

    @Override
    public HelpArticleDTO publishArticle(Long id) {
        Optional<HelpArticle> optionalArticle = articleRepository.findById(id);
        if (optionalArticle.isPresent()) {
            HelpArticle article = optionalArticle.get();
            article.setIsPublished(true);
            article = articleRepository.save(article);
            return convertToArticleDTO(article);
        }
        throw new RuntimeException("Article not found with id: " + id);
    }

    @Override
    public HelpArticleDTO unpublishArticle(Long id) {
        Optional<HelpArticle> optionalArticle = articleRepository.findById(id);
        if (optionalArticle.isPresent()) {
            HelpArticle article = optionalArticle.get();
            article.setIsPublished(false);
            article = articleRepository.save(article);
            return convertToArticleDTO(article);
        }
        throw new RuntimeException("Article not found with id: " + id);
    }

    @Override
    public HelpFAQDTO createFAQ(HelpFAQDTO faqDTO) {
        // Use current user context or system user
        return createFAQ(faqDTO, 1L); // TODO: Get current user from security context
    }

    @Override
    public HelpFAQDTO updateFAQ(Long id, HelpFAQDTO faqDTO) {
        // Use current user context or system user
        return updateFAQ(id, faqDTO, 1L); // TODO: Get current user from security context
    }

    @Override
    public Page<HelpFAQDTO> getAllFAQsForAdmin(Pageable pageable, String category, Boolean isActive) {
        Page<HelpFAQ> faqs;
        
        if (category != null && isActive != null) {
            faqs = faqRepository.findByCategoryAndIsPublished(category, isActive, pageable);
        } else if (category != null) {
            faqs = faqRepository.findByCategory(category, pageable);
        } else if (isActive != null) {
            faqs = faqRepository.findByIsPublished(isActive, pageable);
        } else {
            faqs = faqRepository.findAll(pageable);
        }
        
        return faqs.map(this::convertToFAQDTO);
    }

    @Override
    public Page<SupportTicketDTO> getAllTickets(Pageable pageable, String status, String priority) {
        // For now, delegate to existing method
        return getAllSupportTickets(status, priority, null, pageable);
    }

    @Override
    public SupportTicketDTO updateTicket(Long id, SupportTicketDTO ticketDTO) {
        Optional<SupportTicket> optionalTicket = ticketRepository.findById(id);
        if (optionalTicket.isPresent()) {
            SupportTicket ticket = optionalTicket.get();
            
            if (ticketDTO.getStatus() != null) {
                ticket.setStatus(SupportTicket.Status.valueOf(ticketDTO.getStatus()));
            }
            if (ticketDTO.getPriority() != null) {
                ticket.setPriority(SupportTicket.Priority.valueOf(ticketDTO.getPriority()));
            }
            if (ticketDTO.getAssignedTo() != null) {
                ticket.setAssignedTo(ticketDTO.getAssignedTo());
            }
            
            ticket = ticketRepository.save(ticket);
            return convertToTicketDTO(ticket);
        }
        throw new RuntimeException("Ticket not found with id: " + id);
    }

    @Override
    public SupportTicketDTO respondToTicket(Long id, String response) {
        Optional<SupportTicket> optionalTicket = ticketRepository.findById(id);
        if (optionalTicket.isPresent()) {
            SupportTicket ticket = optionalTicket.get();

            // Append response to description field until proper responses table is implemented
            if (response != null && !response.trim().isEmpty()) {
                String existingDescription = ticket.getDescription();
                String timestamp = java.time.LocalDateTime.now().toString();
                String updatedDescription = existingDescription +
                    "\n\n--- Response [" + timestamp + "] ---\n" + response;
                ticket.setDescription(updatedDescription);
            }

            // Update status to in-progress
            ticket.setStatus(SupportTicket.Status.IN_PROGRESS);
            ticket = ticketRepository.save(ticket);
            return convertToTicketDTO(ticket);
        }
        throw new RuntimeException("Ticket not found with id: " + id);
    }

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            // Create Document entity for the uploaded file
            Document document = new Document();
            document.setTitle(file.getOriginalFilename());
            document.setFileName(file.getOriginalFilename());
            document.setFileType(getFileExtension(file.getOriginalFilename()));
            document.setFileSize(file.getSize());
            document.setMimeType(file.getContentType());
            document.setStorageProvider(Document.StorageProvider.valueOf(defaultStorageProvider));
            document.setDocumentType(Document.DocumentType.ATTACHMENT);
            document.setAccessPermissions(Document.AccessPermission.PUBLIC);
            document.setUploadedBy(1L); // TODO: Get from security context

            // Upload to cloud storage
            logger.info("Uploading help article file: {} using provider: {}", file.getOriginalFilename(), defaultStorageProvider);
            CloudStorageService.CloudUploadResult uploadResult = cloudStorageService.uploadFile(file, document);

            // Update document with cloud storage details
            document.setExternalFileId(uploadResult.getFileId());
            document.setExternalUrl(uploadResult.getFileUrl());
            document.setDownloadUrl(uploadResult.getDownloadUrl());

            // Save document to database
            Document savedDocument = documentRepository.save(document);
            logger.info("File uploaded successfully. Document ID: {}, External URL: {}", savedDocument.getId(), savedDocument.getExternalUrl());

            return savedDocument.getDownloadUrl() != null ? savedDocument.getDownloadUrl() : savedDocument.getExternalUrl();
        } catch (Exception e) {
            logger.error("Failed to upload file: {}", e.getMessage(), e);
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    @Override
    public Map<String, Object> importArticles(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            // TODO: Implement actual file parsing (JSON/CSV)
            // For now, return mock result
            result.put("success", true);
            result.put("imported", 0);
            result.put("failed", 0);
            result.put("message", "Import functionality not yet implemented");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> importFAQs(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            // TODO: Implement actual file parsing (JSON/CSV)
            // For now, return mock result
            result.put("success", true);
            result.put("imported", 0);
            result.put("failed", 0);
            result.put("message", "Import functionality not yet implemented");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> getHelpAnalytics(String period, String type) {
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalArticles", articleRepository.count());
        analytics.put("totalFAQs", faqRepository.count());
        analytics.put("totalTickets", ticketRepository.count());
        analytics.put("openTickets", ticketRepository.countByStatus(SupportTicket.Status.OPEN));
        analytics.put("period", period);
        analytics.put("type", type);
        return analytics;
    }

    @Override
    public List<HelpArticleDTO> getPopularArticles(int limit) {
        // TODO: Implement proper sorting by view count
        // For now, return the first few articles
        return articleRepository.findByIsPublishedTrueOrderBySortOrderAscCreatedAtDesc()
                .stream()
                .limit(limit)
                .map(this::convertToArticleDTO)
                .toList();
    }

    @Override
    public Map<String, Long> getPopularSearchTerms(int limit) {
        // TODO: Implement search analytics tracking
        // For now, return mock data
        Map<String, Long> searchTerms = new HashMap<>();
        searchTerms.put("meeting", 150L);
        searchTerms.put("calendar", 120L);
        searchTerms.put("users", 95L);
        searchTerms.put("permissions", 80L);
        searchTerms.put("settings", 75L);
        return searchTerms;
    }

    // ===============================
    // Helper Methods
    // ===============================

    private String truncateContent(String content, int maxLength) {
        if (content == null || content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }
}