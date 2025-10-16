package com.civicchain.service;

import com.civicchain.model.Report;
import com.civicchain.model.User;
import com.civicchain.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReportService {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private MLService mlService;
    
    @Autowired
    private UserService userService;
    
    private final String UPLOAD_DIR = "uploads/";
    
    public List<Report> getAllReports() {
        return reportRepository.findAllReportsOrderByDate();
    }
    
    public Optional<Report> getReportById(Long id) {
        return reportRepository.findById(id);
    }
    
    public List<Report> getReportsByUser(User user) {
        return reportRepository.findByReporter(user);
    }
    
    public List<Report> getPendingReports() {
        return reportRepository.findPendingReports();
    }
    
    public List<Report> getVerifiedReports() {
        return reportRepository.findVerifiedReports();
    }
    
    public Report createReport(Report report, MultipartFile imageFile, MultipartFile audioFile) {
        try {
            // Save files if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                String imagePath = saveFile(imageFile, "images");
                report.setImagePath(imagePath);
            }
            
            if (audioFile != null && !audioFile.isEmpty()) {
                String audioPath = saveFile(audioFile, "audio");
                report.setAudioPath(audioPath);
            }
            
            // Save report
            Report savedReport = reportRepository.save(report);
            
            // Send to ML service for AI verification if image is provided
            if (report.getImagePath() != null) {
                try {
                    mlService.verifyReportAsync(savedReport);
                } catch (Exception e) {
                    System.err.println("ML verification failed: " + e.getMessage());
                }
            }
            
            // Award XP to user
            if (report.getReporter() != null) {
                userService.addXpToUser(report.getReporter().getId(), 10);
            }
            
            return savedReport;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create report: " + e.getMessage());
        }
    }
    
    public Report updateReport(Report report) {
        return reportRepository.save(report);
    }
    
    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
    
    public Report approveReport(Long id) {
        Report report = reportRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(Report.Status.VERIFIED);
        report.setVerified(true);
        return reportRepository.save(report);
    }
    
    public Report rejectReport(Long id) {
        Report report = reportRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(Report.Status.REJECTED);
        return reportRepository.save(report);
    }
    
    private String saveFile(MultipartFile file, String subDir) throws IOException {
        // Create directories if they don't exist
        Path uploadPath = Paths.get(UPLOAD_DIR + subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);
        
        return subDir + "/" + filename;
    }
    
    public Long getReportCountByStatus(Report.Status status) {
        return reportRepository.countByStatus(status);
    }
    
    public List<Report> getReportsForHeatmap(String severity, String category) {
        if (severity != null && category != null) {
            return reportRepository.findBySeverityAndCategory(
                Report.Severity.valueOf(severity.toUpperCase()), 
                Report.Category.valueOf(category.toUpperCase())
            );
        } else if (severity != null) {
            return reportRepository.findBySeverity(Report.Severity.valueOf(severity.toUpperCase()));
        } else if (category != null) {
            return reportRepository.findByCategory(Report.Category.valueOf(category.toUpperCase()));
        } else {
            return reportRepository.findAllReportsOrderByDate();
        }
    }
    
    public Long getReportCountBySeverity(Report.Severity severity) {
        return reportRepository.countBySeverity(severity);
    }
}
