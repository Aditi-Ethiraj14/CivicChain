package com.civicchain.controller;

import com.civicchain.model.Report;
import com.civicchain.model.User;
import com.civicchain.service.ReportService;
import com.civicchain.service.UserService;
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
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminApiController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ReportService reportService;
    
    // Check if user is admin
    private boolean isAdmin(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return false;
        }
        User currentUser = (User) session.getAttribute("user");
        return currentUser.getRole() == User.Role.ADMIN;
    }
    
    @GetMapping("/reports")
    @Transactional
    public ResponseEntity<?> getAllReports(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        
        List<Report> allReports = reportService.getAllReports();
        
        // Create serializable report data
        List<Map<String, Object>> reportsData = new ArrayList<>();
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
            reportData.put("verified", report.getVerified());
            reportData.put("createdAt", report.getCreatedAt());
            
            // Add reporter information
            if (report.getReporter() != null) {
                Map<String, Object> reporter = new HashMap<>();
                reporter.put("id", report.getReporter().getId());
                reporter.put("username", report.getReporter().getUsername());
                reporter.put("email", report.getReporter().getEmail());
                reportData.put("reporter", reporter);
            }
            
            reportsData.add(reportData);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("reports", reportsData);
        response.put("success", true);
        response.put("totalReports", allReports.size());
        response.put("pendingReports", reportService.getPendingReports().size());
        response.put("verifiedReports", reportService.getVerifiedReports().size());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        
        List<User> allUsers = userService.getAllUsers();
        
        // Create serializable user data
        List<Map<String, Object>> usersData = new ArrayList<>();
        for (User user : allUsers) {
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            userData.put("xp", user.getXp());
            userData.put("level", user.getLevel());
            userData.put("walletAddress", user.getWalletAddress());
            userData.put("createdAt", user.getCreatedAt());
            
            usersData.add(userData);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", usersData);
        response.put("success", true);
        response.put("totalUsers", allUsers.size());
        response.put("activeUsers", allUsers.stream().mapToInt(u -> u.getXp() > 0 ? 1 : 0).sum());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reports/{id}/approve")
    public ResponseEntity<?> approveReport(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        
        try {
            reportService.approveReport(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Report approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/reports/{id}/reject")
    public ResponseEntity<?> rejectReport(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        
        try {
            reportService.rejectReport(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Report rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin access required"));
        }
        
        try {
            User user = userService.getUserById(id).orElseThrow(() -> new RuntimeException("User not found"));
            
            if (updates.containsKey("role")) {
                user.setRole(User.Role.valueOf(updates.get("role").toString()));
            }
            if (updates.containsKey("xp")) {
                user.setXp((Integer) updates.get("xp"));
            }
            
            userService.updateUser(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "User updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}