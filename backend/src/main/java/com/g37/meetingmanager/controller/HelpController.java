package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.dto.HelpArticleDTO;
import com.g37.meetingmanager.dto.HelpFAQDTO;
import com.g37.meetingmanager.dto.SearchResultDTO;
import com.g37.meetingmanager.service.HelpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/help")
@CrossOrigin(origins = "*")
public class HelpController {

    @Autowired
    private HelpService helpService;

    @GetMapping("/articles")
    public ResponseEntity<List<HelpArticleDTO>> getPublishedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category) {
        
        Pageable pageable = PageRequest.of(page, size);
        List<HelpArticleDTO> articles;
        
        if (category != null && !category.isEmpty()) {
            articles = helpService.getArticlesByCategory(category, pageable);
        } else {
            articles = helpService.getAllArticles(pageable);
        }
        
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<HelpArticleDTO> getArticleById(@PathVariable Long id) {
        try {
            HelpArticleDTO article = helpService.getArticleById(id);
            return ResponseEntity.ok(article);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/faqs")
    public ResponseEntity<List<HelpFAQDTO>> getAllFAQs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<HelpFAQDTO> faqs = helpService.getAllFAQs(pageable);
        return ResponseEntity.ok(faqs);
    }

    @GetMapping("/faqs/{id}")
    public ResponseEntity<HelpFAQDTO> getFAQById(@PathVariable Long id) {
        try {
            HelpFAQDTO faq = helpService.getFAQById(id);
            return ResponseEntity.ok(faq);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchResultDTO>> searchHelpContent(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        Pageable pageable = PageRequest.of(page, size);
        List<SearchResultDTO> results = helpService.searchContent(query, pageable);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getArticleCategories() {
        List<String> categories = helpService.getHelpCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getHelpStatistics() {
        Map<String, Object> stats = helpService.getHelpStatistics();
        return ResponseEntity.ok(stats);
    }
}
