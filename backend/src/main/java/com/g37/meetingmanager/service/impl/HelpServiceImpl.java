package com.g37.meetingmanager.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.g37.meetingmanager.dto.*;
import com.g37.meetingmanager.model.*;
import com.g37.meetingmanager.repository.mysql.*;
import com.g37.meetingmanager.entity.mysql.SearchAnalytics;
import com.g37.meetingmanager.service.CloudStorageService;
import com.g37.meetingmanager.service.HelpService;
import com.g37.meetingmanager.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
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
    private final SearchAnalyticsRepository searchAnalyticsRepository;

    @Value("${help.default.storage.provider:ONEDRIVE}")
    private String defaultStorageProvider;

    public HelpServiceImpl(HelpArticleRepository articleRepository,
                          HelpFAQRepository faqRepository,
                          SupportTicketRepository ticketRepository,
                          CloudStorageService cloudStorageService,
                          DocumentRepository documentRepository,
                          SearchAnalyticsRepository searchAnalyticsRepository) {
        this.articleRepository = articleRepository;
        this.faqRepository = faqRepository;
        this.ticketRepository = ticketRepository;
        this.cloudStorageService = cloudStorageService;
        this.documentRepository = documentRepository;
        this.searchAnalyticsRepository = searchAnalyticsRepository;
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

        // Track search analytics
        trackSearchAnalytics(query, results.size());
        
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
        return createArticle(articleDTO, getCurrentUserId());
    }

    @Override
    public HelpArticleDTO updateArticle(Long id, HelpArticleDTO articleDTO) {
        // Use current user context or system user
        return updateArticle(id, articleDTO, getCurrentUserId());
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
        return createFAQ(faqDTO, getCurrentUserId());
    }

    @Override
    public HelpFAQDTO updateFAQ(Long id, HelpFAQDTO faqDTO) {
        // Use current user context or system user
        return updateFAQ(id, faqDTO, getCurrentUserId());
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
            document.setUploadedBy(getCurrentUserId());

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
        int importedCount = 0;
        int failedCount = 0;
        List<String> errors = new ArrayList<>();
        
        try {
            String fileExtension = getFileExtension(file.getOriginalFilename());
            Long currentUserId = getCurrentUserId();
            List<HelpArticleDTO> articlesToImport = new ArrayList<>();
            
            if ("json".equalsIgnoreCase(fileExtension)) {
                articlesToImport = parseArticlesFromJson(file);
            } else if ("csv".equalsIgnoreCase(fileExtension)) {
                articlesToImport = parseArticlesFromCsv(file);
            } else {
                result.put("success", false);
                result.put("error", "Unsupported file format. Please use JSON or CSV files.");
                return result;
            }
            
            // Process each article
            for (HelpArticleDTO article : articlesToImport) {
                try {
                    // Validate required fields
                    if (article.getTitle() == null || article.getTitle().trim().isEmpty()) {
                        errors.add("Article missing title");
                        failedCount++;
                        continue;
                    }
                    if (article.getContent() == null || article.getContent().trim().isEmpty()) {
                        errors.add("Article '" + article.getTitle() + "' missing content");
                        failedCount++;
                        continue;
                    }
                    
                    // Set defaults if not provided
                    if (article.getDescription() == null || article.getDescription().trim().isEmpty()) {
                        article.setDescription(article.getTitle());
                    }
                    if (article.getCategory() == null || article.getCategory().trim().isEmpty()) {
                        article.setCategory("general");
                    }
                    if (article.getIsPublished() == null) {
                        article.setIsPublished(true);
                    }
                    if (article.getSortOrder() == null) {
                        article.setSortOrder(0);
                    }
                    
                    // Create the article
                    createArticle(article, currentUserId);
                    importedCount++;
                    
                } catch (Exception e) {
                    errors.add("Failed to import article '" + article.getTitle() + "': " + e.getMessage());
                    failedCount++;
                    logger.warn("Failed to import article: {}", article.getTitle(), e);
                }
            }
            
            result.put("success", true);
            result.put("imported", importedCount);
            result.put("failed", failedCount);
            result.put("errors", errors);
            result.put("message", String.format("Import completed: %d successful, %d failed", importedCount, failedCount));
            
        } catch (Exception e) {
            logger.error("Error during article import", e);
            result.put("success", false);
            result.put("imported", importedCount);
            result.put("failed", failedCount);
            result.put("error", "Import failed: " + e.getMessage());
            result.put("errors", errors);
        }
        
        return result;
    }

    @Override
    public Map<String, Object> importFAQs(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        int importedCount = 0;
        int failedCount = 0;
        List<String> errors = new ArrayList<>();
        
        try {
            String fileExtension = getFileExtension(file.getOriginalFilename());
            Long currentUserId = getCurrentUserId();
            List<HelpFAQDTO> faqsToImport = new ArrayList<>();
            
            if ("json".equalsIgnoreCase(fileExtension)) {
                faqsToImport = parseFAQsFromJson(file);
            } else if ("csv".equalsIgnoreCase(fileExtension)) {
                faqsToImport = parseFAQsFromCsv(file);
            } else {
                result.put("success", false);
                result.put("error", "Unsupported file format. Please use JSON or CSV files.");
                return result;
            }
            
            // Process each FAQ
            for (HelpFAQDTO faq : faqsToImport) {
                try {
                    // Validate required fields
                    if (faq.getQuestion() == null || faq.getQuestion().trim().isEmpty()) {
                        errors.add("FAQ missing question");
                        failedCount++;
                        continue;
                    }
                    if (faq.getAnswer() == null || faq.getAnswer().trim().isEmpty()) {
                        errors.add("FAQ '" + faq.getQuestion() + "' missing answer");
                        failedCount++;
                        continue;
                    }
                    
                    // Set defaults if not provided
                    if (faq.getCategory() == null || faq.getCategory().trim().isEmpty()) {
                        faq.setCategory("general");
                    }
                    if (faq.getIsPublished() == null) {
                        faq.setIsPublished(true);
                    }
                    if (faq.getSortOrder() == null) {
                        faq.setSortOrder(0);
                    }
                    
                    // Create the FAQ
                    createFAQ(faq, currentUserId);
                    importedCount++;
                    
                } catch (Exception e) {
                    errors.add("Failed to import FAQ '" + faq.getQuestion() + "': " + e.getMessage());
                    failedCount++;
                    logger.warn("Failed to import FAQ: {}", faq.getQuestion(), e);
                }
            }
            
            result.put("success", true);
            result.put("imported", importedCount);
            result.put("failed", failedCount);
            result.put("errors", errors);
            result.put("message", String.format("Import completed: %d successful, %d failed", importedCount, failedCount));
            
        } catch (Exception e) {
            logger.error("Error during FAQ import", e);
            result.put("success", false);
            result.put("imported", importedCount);
            result.put("failed", failedCount);
            result.put("error", "Import failed: " + e.getMessage());
            result.put("errors", errors);
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
        // Use the repository's findMostViewed method to get articles sorted by view count
        Pageable pageable = Pageable.ofSize(limit);
        Page<HelpArticle> popularArticles = articleRepository.findMostViewed(pageable);
        
        logger.debug("Retrieved {} popular articles (limit: {})", popularArticles.getContent().size(), limit);
        
        return popularArticles.getContent()
                .stream()
                .map(this::convertToArticleDTO)
                .toList();
    }

    @Override
    public Map<String, Long> getPopularSearchTerms(int limit) {
        // Get popular search terms from analytics data
        Pageable pageable = Pageable.ofSize(limit);
        List<SearchAnalytics> topSearches = searchAnalyticsRepository.findTopSearchTerms(pageable);
        
        Map<String, Long> searchTerms = new LinkedHashMap<>();
        for (SearchAnalytics analytics : topSearches) {
            searchTerms.put(analytics.getSearchTerm(), analytics.getSearchCount());
        }
        
        logger.debug("Retrieved {} popular search terms (limit: {})", searchTerms.size(), limit);
        
        // If no real data exists yet, return some sample data for demonstration
        if (searchTerms.isEmpty()) {
            logger.debug("No search analytics data found, returning sample data");
            searchTerms.put("meeting", 150L);
            searchTerms.put("calendar", 120L);
            searchTerms.put("users", 95L);
            searchTerms.put("permissions", 80L);
            searchTerms.put("settings", 75L);
        }
        
        return searchTerms;
    }

    // ===============================
    // Helper Methods
    // ===============================

    /**
     * Get current user ID from security context with fallback to system user
     * @return Current user ID or 1L (system user) if not authenticated
     */
    private Long getCurrentUserId() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId != null) {
            logger.debug("Retrieved current user ID from security context: {}", currentUserId);
            return currentUserId;
        }
        
        logger.debug("No authenticated user found, falling back to system user (ID: 1)");
        return 1L; // Fallback to system user
    }

    /**
     * Track search analytics for popular search terms
     * @param searchTerm The search term used
     * @param resultsCount Number of results returned
     */
    private void trackSearchAnalytics(String searchTerm, int resultsCount) {
        try {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return;
            }

            String normalizedTerm = searchTerm.trim().toLowerCase();
            Long userId = getCurrentUserId();

            // Find existing analytics entry or create new one
            Optional<SearchAnalytics> existingAnalytics = searchAnalyticsRepository.findBySearchTerm(normalizedTerm);
            
            if (existingAnalytics.isPresent()) {
                // Update existing entry
                SearchAnalytics analytics = existingAnalytics.get();
                analytics.incrementSearchCount();
                analytics.setResultsCount(resultsCount);
                searchAnalyticsRepository.save(analytics);
                logger.debug("Updated search analytics for term '{}', new count: {}", normalizedTerm, analytics.getSearchCount());
            } else {
                // Create new entry
                SearchAnalytics analytics = new SearchAnalytics(normalizedTerm, userId, resultsCount);
                searchAnalyticsRepository.save(analytics);
                logger.debug("Created new search analytics entry for term '{}'", normalizedTerm);
            }
        } catch (Exception e) {
            logger.warn("Failed to track search analytics for term '{}': {}", searchTerm, e.getMessage());
            // Don't fail the search if analytics tracking fails
        }
    }

    private String truncateContent(String content, int maxLength) {
        if (content == null || content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + "...";
    }

    // ===============================
    // File Parsing Methods
    // ===============================

    /**
     * Parse help articles from JSON file
     */
    private List<HelpArticleDTO> parseArticlesFromJson(MultipartFile file) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        List<HelpArticleDTO> articles = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            // Try to parse as array first
            try {
                List<Map<String, Object>> rawArticles = objectMapper.readValue(reader, 
                    new TypeReference<List<Map<String, Object>>>() {});
                
                for (Map<String, Object> rawArticle : rawArticles) {
                    HelpArticleDTO article = mapToArticleDTO(rawArticle);
                    if (article != null) {
                        articles.add(article);
                    }
                }
            } catch (Exception e) {
                // If array parsing fails, try parsing as single object
                logger.debug("Array parsing failed, trying single object: {}", e.getMessage());
                reader.reset();
                Map<String, Object> rawArticle = objectMapper.readValue(reader, 
                    new TypeReference<Map<String, Object>>() {});
                HelpArticleDTO article = mapToArticleDTO(rawArticle);
                if (article != null) {
                    articles.add(article);
                }
            }
        }
        
        return articles;
    }

    /**
     * Parse help articles from CSV file
     */
    private List<HelpArticleDTO> parseArticlesFromCsv(MultipartFile file) throws Exception {
        List<HelpArticleDTO> articles = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("CSV file is empty");
            }
            
            String[] headers = headerLine.split(",");
            Map<String, Integer> columnMap = new HashMap<>();
            
            // Map column headers to indices
            for (int i = 0; i < headers.length; i++) {
                columnMap.put(headers[i].trim().toLowerCase(), i);
            }
            
            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                try {
                    String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"); // Handle CSV with quotes
                    HelpArticleDTO article = mapCsvToArticleDTO(values, columnMap);
                    if (article != null) {
                        articles.add(article);
                    }
                } catch (Exception e) {
                    logger.warn("Failed to parse CSV line {}: {}", lineNumber, e.getMessage());
                }
            }
        }
        
        return articles;
    }

    /**
     * Parse FAQs from JSON file
     */
    private List<HelpFAQDTO> parseFAQsFromJson(MultipartFile file) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        List<HelpFAQDTO> faqs = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            // Try to parse as array first
            try {
                List<Map<String, Object>> rawFaqs = objectMapper.readValue(reader, 
                    new TypeReference<List<Map<String, Object>>>() {});
                
                for (Map<String, Object> rawFaq : rawFaqs) {
                    HelpFAQDTO faq = mapToFaqDTO(rawFaq);
                    if (faq != null) {
                        faqs.add(faq);
                    }
                }
            } catch (Exception e) {
                // If array parsing fails, try parsing as single object
                logger.debug("Array parsing failed, trying single object: {}", e.getMessage());
                reader.reset();
                Map<String, Object> rawFaq = objectMapper.readValue(reader, 
                    new TypeReference<Map<String, Object>>() {});
                HelpFAQDTO faq = mapToFaqDTO(rawFaq);
                if (faq != null) {
                    faqs.add(faq);
                }
            }
        }
        
        return faqs;
    }

    /**
     * Parse FAQs from CSV file
     */
    private List<HelpFAQDTO> parseFAQsFromCsv(MultipartFile file) throws Exception {
        List<HelpFAQDTO> faqs = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("CSV file is empty");
            }
            
            String[] headers = headerLine.split(",");
            Map<String, Integer> columnMap = new HashMap<>();
            
            // Map column headers to indices
            for (int i = 0; i < headers.length; i++) {
                columnMap.put(headers[i].trim().toLowerCase(), i);
            }
            
            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                try {
                    String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"); // Handle CSV with quotes
                    HelpFAQDTO faq = mapCsvToFaqDTO(values, columnMap);
                    if (faq != null) {
                        faqs.add(faq);
                    }
                } catch (Exception e) {
                    logger.warn("Failed to parse CSV line {}: {}", lineNumber, e.getMessage());
                }
            }
        }
        
        return faqs;
    }

    /**
     * Map JSON object to HelpArticleDTO
     */
    private HelpArticleDTO mapToArticleDTO(Map<String, Object> rawArticle) {
        try {
            HelpArticleDTO article = new HelpArticleDTO();
            
            // Required fields
            article.setTitle(getStringValue(rawArticle, "title"));
            article.setContent(getStringValue(rawArticle, "content"));
            
            // Optional fields
            article.setDescription(getStringValue(rawArticle, "description"));
            article.setCategory(getStringValue(rawArticle, "category"));
            
            // Handle tags (can be array or comma-separated string)
            Object tagsObj = rawArticle.get("tags");
            if (tagsObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> tagsList = (List<String>) tagsObj;
                article.setTags(tagsList);
            } else if (tagsObj instanceof String) {
                String tagsStr = (String) tagsObj;
                article.setTags(Arrays.asList(tagsStr.split("\\s*,\\s*")));
            }
            
            // Boolean fields
            article.setIsPublished(getBooleanValue(rawArticle, "isPublished", true));
            
            // Integer fields
            article.setSortOrder(getIntegerValue(rawArticle, "sortOrder", 0));
            
            return article;
        } catch (Exception e) {
            logger.error("Failed to map JSON to article DTO: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Map CSV values to HelpArticleDTO
     */
    private HelpArticleDTO mapCsvToArticleDTO(String[] values, Map<String, Integer> columnMap) {
        try {
            HelpArticleDTO article = new HelpArticleDTO();
            
            // Required fields
            article.setTitle(getCsvValue(values, columnMap, "title"));
            article.setContent(getCsvValue(values, columnMap, "content"));
            
            // Optional fields
            article.setDescription(getCsvValue(values, columnMap, "description"));
            article.setCategory(getCsvValue(values, columnMap, "category"));
            
            // Tags
            String tagsStr = getCsvValue(values, columnMap, "tags");
            if (tagsStr != null && !tagsStr.trim().isEmpty()) {
                article.setTags(Arrays.asList(tagsStr.split("\\s*,\\s*")));
            }
            
            // Boolean fields
            String publishedStr = getCsvValue(values, columnMap, "ispublished", "published");
            article.setIsPublished(!"false".equalsIgnoreCase(publishedStr) && !"0".equals(publishedStr));
            
            // Integer fields
            String sortOrderStr = getCsvValue(values, columnMap, "sortorder", "sort_order");
            try {
                article.setSortOrder(sortOrderStr != null ? Integer.parseInt(sortOrderStr.trim()) : 0);
            } catch (NumberFormatException e) {
                article.setSortOrder(0);
            }
            
            return article;
        } catch (Exception e) {
            logger.error("Failed to map CSV to article DTO: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Map JSON object to HelpFAQDTO
     */
    private HelpFAQDTO mapToFaqDTO(Map<String, Object> rawFaq) {
        try {
            HelpFAQDTO faq = new HelpFAQDTO();
            
            // Required fields
            faq.setQuestion(getStringValue(rawFaq, "question"));
            faq.setAnswer(getStringValue(rawFaq, "answer"));
            
            // Optional fields
            faq.setCategory(getStringValue(rawFaq, "category"));
            
            // Handle tags (can be array or comma-separated string)
            Object tagsObj = rawFaq.get("tags");
            if (tagsObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> tagsList = (List<String>) tagsObj;
                faq.setTags(tagsList);
            } else if (tagsObj instanceof String) {
                String tagsStr = (String) tagsObj;
                faq.setTags(Arrays.asList(tagsStr.split("\\s*,\\s*")));
            }
            
            // Boolean fields
            faq.setIsPublished(getBooleanValue(rawFaq, "isPublished", true));
            
            // Integer fields
            faq.setSortOrder(getIntegerValue(rawFaq, "sortOrder", 0));
            
            return faq;
        } catch (Exception e) {
            logger.error("Failed to map JSON to FAQ DTO: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Map CSV values to HelpFAQDTO
     */
    private HelpFAQDTO mapCsvToFaqDTO(String[] values, Map<String, Integer> columnMap) {
        try {
            HelpFAQDTO faq = new HelpFAQDTO();
            
            // Required fields
            faq.setQuestion(getCsvValue(values, columnMap, "question"));
            faq.setAnswer(getCsvValue(values, columnMap, "answer"));
            
            // Optional fields
            faq.setCategory(getCsvValue(values, columnMap, "category"));
            
            // Tags
            String tagsStr = getCsvValue(values, columnMap, "tags");
            if (tagsStr != null && !tagsStr.trim().isEmpty()) {
                faq.setTags(Arrays.asList(tagsStr.split("\\s*,\\s*")));
            }
            
            // Boolean fields
            String publishedStr = getCsvValue(values, columnMap, "ispublished", "published");
            faq.setIsPublished(!"false".equalsIgnoreCase(publishedStr) && !"0".equals(publishedStr));
            
            // Integer fields
            String sortOrderStr = getCsvValue(values, columnMap, "sortorder", "sort_order");
            try {
                faq.setSortOrder(sortOrderStr != null ? Integer.parseInt(sortOrderStr.trim()) : 0);
            } catch (NumberFormatException e) {
                faq.setSortOrder(0);
            }
            
            return faq;
        } catch (Exception e) {
            logger.error("Failed to map CSV to FAQ DTO: {}", e.getMessage());
            return null;
        }
    }

    // ===============================
    // Helper Methods for Parsing
    // ===============================

    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString().trim() : null;
    }

    private Boolean getBooleanValue(Map<String, Object> map, String key, Boolean defaultValue) {
        Object value = map.get(key);
        if (value == null) return defaultValue;
        if (value instanceof Boolean) return (Boolean) value;
        String strValue = value.toString().toLowerCase();
        return "true".equals(strValue) || "1".equals(strValue) || "yes".equals(strValue);
    }

    private Integer getIntegerValue(Map<String, Object> map, String key, Integer defaultValue) {
        Object value = map.get(key);
        if (value == null) return defaultValue;
        if (value instanceof Integer) return (Integer) value;
        try {
            return Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private String getCsvValue(String[] values, Map<String, Integer> columnMap, String... possibleKeys) {
        for (String key : possibleKeys) {
            Integer index = columnMap.get(key);
            if (index != null && index < values.length) {
                String value = values[index].trim();
                // Remove quotes if present
                if (value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                }
                return value.isEmpty() ? null : value;
            }
        }
        return null;
    }
}