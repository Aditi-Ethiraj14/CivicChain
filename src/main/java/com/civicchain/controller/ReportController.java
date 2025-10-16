package com.civicchain.controller;

import com.civicchain.model.Report;
import com.civicchain.model.User;
import com.civicchain.service.ReportService;
import com.civicchain.service.UserService;
import com.civicchain.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private VerificationService verificationService;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllReports() {
        List<Report> reports = reportService.getAllReports();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("reports", reports.stream().map(this::mapReportToResponse).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getReport(@PathVariable Long id) {
        return reportService.getReportById(id)
            .map(report -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("report", mapReportToResponse(report));
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/pending")
    public ResponseEntity<Map<String, Object>> getPendingReports() {
        List<Report> reports = reportService.getPendingReports();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("reports", reports.stream().map(this::mapReportToResponse).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/verified")
    public ResponseEntity<Map<String, Object>> getVerifiedReports() {
        List<Report> reports = reportService.getVerifiedReports();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("reports", reports.stream().map(this::mapReportToResponse).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getReportsByUser(@PathVariable Long userId) {
        User user = userService.getUserById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        List<Report> reports = reportService.getReportsByUser(user);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("reports", reports.stream().map(this::mapReportToResponse).collect(Collectors.toList()));
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReport(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "audio", required = false) MultipartFile audioFile) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            User user = userService.getUserById(userId).orElse(null);
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            Report report = new Report();
            report.setTitle(title);
            report.setDescription(description);
            report.setCategory(Report.Category.valueOf(category.toUpperCase()));
            report.setReporter(user);
            report.setLatitude(latitude);
            report.setLongitude(longitude);
            report.setLocation(location);
            
            Report savedReport = reportService.createReport(report, imageFile, audioFile);
            
            response.put("success", true);
            response.put("message", "Report created successfully");
            response.put("report", mapReportToResponse(savedReport));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create report: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveReport(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Report report = reportService.approveReport(id);
            response.put("success", true);
            response.put("message", "Report approved successfully");
            response.put("report", mapReportToResponse(report));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectReport(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Report report = reportService.rejectReport(id);
            response.put("success", true);
            response.put("message", "Report rejected");
            response.put("report", mapReportToResponse(report));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    private Map<String, Object> mapReportToResponse(Report report) {
        Map<String, Object> reportMap = new HashMap<>();
        reportMap.put("id", report.getId());
        reportMap.put("title", report.getTitle());
        reportMap.put("description", report.getDescription());
        reportMap.put("category", report.getCategory().name());
        reportMap.put("status", report.getStatus().name());
        reportMap.put("upvotes", report.getUpvotes());
        reportMap.put("downvotes", report.getDownvotes());
        reportMap.put("verified", report.getVerified());
        reportMap.put("aiVerified", report.getAiVerified());
        reportMap.put("aiConfidence", report.getAiConfidence());
        reportMap.put("aiPrediction", report.getAiPrediction());
        reportMap.put("imagePath", report.getImagePath());
        reportMap.put("audioPath", report.getAudioPath());
        reportMap.put("latitude", report.getLatitude());
        reportMap.put("longitude", report.getLongitude());
        reportMap.put("location", report.getLocation());
        reportMap.put("createdAt", report.getCreatedAt());
        
        if (report.getReporter() != null) {
            reportMap.put("reporter", Map.of(
                "id", report.getReporter().getId(),
                "username", report.getReporter().getUsername(),
                "level", report.getReporter().getLevel()
            ));
        }
        
        return reportMap;
    }
}