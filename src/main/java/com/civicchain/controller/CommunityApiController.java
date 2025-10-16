package com.civicchain.controller;

import com.civicchain.model.Report;
import com.civicchain.model.User;
import com.civicchain.model.Verification;
import com.civicchain.service.ReportService;
import com.civicchain.service.UserService;
import com.civicchain.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CommunityApiController {
    
    @Autowired
    private ReportService reportService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private VerificationService verificationService;
    
    private User getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return null;
        }
        return (User) session.getAttribute("user");
    }
    
    @GetMapping("/reports/pending")
    @Transactional
    public ResponseEntity<?> getPendingReports(HttpServletRequest request) {
        User currentUser = getCurrentUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        // Get all reports for community validation (including user's own reports)
        List<Report> allReports = reportService.getAllReports();
        
        // Create response with detailed information
        List<Map<String, Object>> reportsWithVotes = new ArrayList<>();
        for (Report report : allReports) {
            Map<String, Object> reportData = new HashMap<>();
            reportData.put("id", report.getId());
            reportData.put("title", report.getTitle());
            reportData.put("description", report.getDescription());
            reportData.put("category", report.getCategory());
            reportData.put("severity", report.getSeverity());
            reportData.put("status", report.getStatus());
            reportData.put("imagePath", report.getImagePath());
            reportData.put("location", report.getLocation());
            reportData.put("latitude", report.getLatitude());
            reportData.put("longitude", report.getLongitude());
            reportData.put("upvotes", report.getUpvotes());
            reportData.put("downvotes", report.getDownvotes());
            reportData.put("aiVerified", report.getAiVerified());
            reportData.put("aiConfidence", report.getAiConfidence());
            reportData.put("createdAt", report.getCreatedAt());
            
            // Add reporter information
            if (report.getReporter() != null) {
                Map<String, Object> reporter = new HashMap<>();
                reporter.put("id", report.getReporter().getId());
                reporter.put("username", report.getReporter().getUsername());
                reportData.put("reporter", reporter);
            }
            
            // Check if current user has voted
            boolean hasVoted = verificationService.hasUserVotedOnReport(currentUser.getId(), report.getId());
            reportData.put("hasVoted", hasVoted);
            
            if (hasVoted) {
                Verification verification = verificationService.getUserVoteForReport(currentUser.getId(), report.getId());
                reportData.put("userVote", verification.getVote() == Verification.VoteType.UPVOTE ? "up" : "down");
            }
            
            reportsWithVotes.add(reportData);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("reports", reportsWithVotes);
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/reports/all")
    public ResponseEntity<?> getAllReports(HttpServletRequest request) {
        User currentUser = getCurrentUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        List<Report> allReports = reportService.getAllReports();
        
        Map<String, Object> response = new HashMap<>();
        response.put("reports", allReports);
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/reports/heatmap")
    public ResponseEntity<?> getHeatmapData(HttpServletRequest request,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String category) {
        User currentUser = getCurrentUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        List<Report> reports = reportService.getReportsForHeatmap(severity, category);
        
        Map<String, Object> response = new HashMap<>();
        response.put("reports", reports);
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reports/{id}/vote")
    public ResponseEntity<?> voteOnReport(@PathVariable Long id, @RequestBody Map<String, String> voteData, HttpServletRequest request) {
        User currentUser = getCurrentUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        try {
            String voteType = voteData.get("voteType"); // "up" or "down"
            Report report = reportService.getReportById(id).orElseThrow(() -> new RuntimeException("Report not found"));
            
            // Check if user already voted on this report
            boolean hasVoted = verificationService.hasUserVotedOnReport(currentUser.getId(), id);
            
            if (hasVoted) {
                return ResponseEntity.badRequest().body(Map.of("error", "You have already voted on this report"));
            }
            
            // Create verification vote
            Verification verification = new Verification();
            verification.setUser(currentUser);
            verification.setReport(report);
            verification.setVote(voteType.equals("up") ? Verification.VoteType.UPVOTE : Verification.VoteType.DOWNVOTE);
            verification.setComment("Community verification vote");
            
            verificationService.saveVerification(verification);
            
            // Update report vote counts
            if (voteType.equals("up")) {
                report.setUpvotes(report.getUpvotes() + 1);
            } else {
                report.setDownvotes(report.getDownvotes() + 1);
            }
            reportService.updateReport(report);
            
            // Award XP to user
            currentUser.addXp(5); // 5 XP for community voting
            userService.updateUser(currentUser);
            
            // Update session with new user data
            HttpSession session = request.getSession();
            session.setAttribute("user", currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", voteType.equals("up") ? "Report verified!" : "Report disputed!");
            response.put("xpEarned", 5);
            response.put("newUpvotes", report.getUpvotes());
            response.put("newDownvotes", report.getDownvotes());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/reports/{id}/votes")
    public ResponseEntity<?> getReportVotes(@PathVariable Long id, HttpServletRequest request) {
        User currentUser = getCurrentUser(request);
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        try {
            Report report = reportService.getReportById(id).orElseThrow(() -> new RuntimeException("Report not found"));
            boolean hasVoted = verificationService.hasUserVotedOnReport(currentUser.getId(), id);
            String userVote = null;
            
            if (hasVoted) {
                Verification verification = verificationService.getUserVoteForReport(currentUser.getId(), id);
                userVote = verification.getVote() == Verification.VoteType.UPVOTE ? "up" : "down";
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("upvotes", report.getUpvotes());
            response.put("downvotes", report.getDownvotes());
            response.put("hasVoted", hasVoted);
            response.put("userVote", userVote);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}