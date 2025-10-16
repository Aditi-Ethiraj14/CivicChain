package com.civicchain.controller;

import com.civicchain.model.Report;
import com.civicchain.model.User;
import com.civicchain.service.ReportService;
import com.civicchain.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;

@Controller
public class PortalController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ReportService reportService;
    
    @GetMapping("/")
    public String home() {
        return "redirect:/login";
    }
    
    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }
    
    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }
    
    @PostMapping("/register")
    public String register(@RequestParam String username, @RequestParam String email, 
                          @RequestParam String password, Model model) {
        try {
            User newUser = userService.createUser(username, email, password);
            model.addAttribute("success", "Registration successful! Please login.");
            return "login";
        } catch (RuntimeException e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }
    
    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password, 
                       Model model, HttpServletRequest request) {
        if (userService.authenticateUser(username, password)) {
            User user = userService.getUserByUsername(username).get();
            
            // Store user in session
            HttpSession session = request.getSession();
            session.setAttribute("user", user);
            session.setAttribute("userId", user.getId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("role", user.getRole().name());
            
            if (user.getRole() == User.Role.ADMIN) {
                return "redirect:/admin-portal";
            } else {
                return "redirect:/user-portal";
            }
        }
        
        model.addAttribute("error", "Invalid credentials");
        return "login";
    }
    
    @GetMapping("/user-portal")
    public String userPortal(Model model, HttpServletRequest request) {
        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return "redirect:/login";
        }
        
        User currentUser = (User) session.getAttribute("user");
        model.addAttribute("currentUser", currentUser);
        
        // Sample data for user portal
        List<Report> allReports = reportService.getAllReports();
        List<Report> pendingReports = reportService.getPendingReports();
        List<User> leaderboard = userService.getTopUsersByXp();
        
        model.addAttribute("totalReports", allReports.size());
        model.addAttribute("pendingReports", pendingReports.size());
        model.addAttribute("reports", allReports.size() > 5 ? allReports.subList(0, 5) : allReports);
        model.addAttribute("leaderboard", leaderboard.size() > 10 ? leaderboard.subList(0, 10) : leaderboard);
        
        return "user-portal";
    }
    
    @GetMapping("/admin-portal")
    public String adminPortal(Model model, HttpServletRequest request) {
        // Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return "redirect:/login";
        }
        
        User currentUser = (User) session.getAttribute("user");
        // Check if user is admin
        if (currentUser.getRole() != User.Role.ADMIN) {
            return "redirect:/user-portal";
        }
        
        model.addAttribute("currentUser", currentUser);
        
        // Sample data for admin portal
        List<Report> allReports = reportService.getAllReports();
        List<Report> pendingReports = reportService.getPendingReports();
        List<Report> verifiedReports = reportService.getVerifiedReports();
        List<User> allUsers = userService.getAllUsers();
        
        model.addAttribute("totalReports", allReports.size());
        model.addAttribute("pendingReports", pendingReports.size());
        model.addAttribute("verifiedReports", verifiedReports.size());
        model.addAttribute("totalUsers", allUsers.size());
        model.addAttribute("reports", pendingReports.size() > 10 ? pendingReports.subList(0, 10) : pendingReports);
        model.addAttribute("users", allUsers.size() > 10 ? allUsers.subList(0, 10) : allUsers);
        
        return "admin-portal";
    }
    
    @PostMapping("/submit-report")
    public String submitReport(@RequestParam String title, @RequestParam String category,
                              @RequestParam String description, @RequestParam(required = false) String location,
                              @RequestParam(required = false, defaultValue = "MODERATE") String severity,
                              HttpServletRequest request, Model model) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return "redirect:/login";
        }
        
        try {
            User currentUser = (User) session.getAttribute("user");
            Report report = new Report(title, description, Report.Category.valueOf(category.toUpperCase()));
            report.setReporter(currentUser);
            report.setSeverity(Report.Severity.valueOf(severity.toUpperCase()));
            
            if (location != null && !location.trim().isEmpty()) {
                report.setLocation(location);
                // Try to parse latitude and longitude from GPS coordinates
                if (location.contains("Lat:") && location.contains("Lng:")) {
                    try {
                        String[] parts = location.split(",");
                        String latStr = parts[0].replace("Lat:", "").trim();
                        String lngStr = parts[1].replace("Lng:", "").trim();
                        report.setLatitude(Double.parseDouble(latStr));
                        report.setLongitude(Double.parseDouble(lngStr));
                    } catch (Exception e) {
                        // If parsing fails, just keep the location text
                    }
                }
            }
            
            reportService.createReport(report, null, null);
            
            model.addAttribute("success", "Report submitted successfully!");
        } catch (Exception e) {
            model.addAttribute("error", "Failed to submit report: " + e.getMessage());
        }
        
        return userPortal(model, request);
    }
    
    @PostMapping("/admin/approve-report/{id}")
    public String approveReport(@PathVariable Long id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return "redirect:/login";
        }
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser.getRole() != User.Role.ADMIN) {
            return "redirect:/user-portal";
        }
        
        try {
            reportService.approveReport(id);
        } catch (Exception e) {
            // Handle error silently for now
        }
        
        return "redirect:/admin-portal";
    }
    
    @PostMapping("/admin/reject-report/{id}")
    public String rejectReport(@PathVariable Long id, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return "redirect:/login";
        }
        
        User currentUser = (User) session.getAttribute("user");
        if (currentUser.getRole() != User.Role.ADMIN) {
            return "redirect:/user-portal";
        }
        
        try {
            reportService.rejectReport(id);
        } catch (Exception e) {
            // Handle error silently for now
        }
        
        return "redirect:/admin-portal";
    }
    
    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return "redirect:/login";
    }
    
    @GetMapping("/browse")
    public String browseIssues(HttpServletRequest request, Model model) {
        HttpSession session = request.getSession(false);
        User currentUser = null;
        if (session != null && session.getAttribute("user") != null) {
            currentUser = (User) session.getAttribute("user");
        }
        model.addAttribute("currentUser", currentUser);
        return "browse-issues";
    }
    
    @GetMapping("/leaderboard")
    public String leaderboard(HttpServletRequest request, Model model) {
        HttpSession session = request.getSession(false);
        User currentUser = null;
        if (session != null && session.getAttribute("user") != null) {
            currentUser = (User) session.getAttribute("user");
        }
        model.addAttribute("currentUser", currentUser);
        return "leaderboard";
    }
}
