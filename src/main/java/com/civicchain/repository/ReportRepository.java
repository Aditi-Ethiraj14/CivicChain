package com.civicchain.repository;

import com.civicchain.model.Report;
import com.civicchain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    List<Report> findByReporter(User reporter);
    
    List<Report> findByStatus(Report.Status status);
    
    List<Report> findByCategory(Report.Category category);
    
    @Query("SELECT r FROM Report r WHERE r.status = 'PENDING' ORDER BY r.createdAt DESC")
    List<Report> findPendingReports();
    
    @Query("SELECT r FROM Report r WHERE r.status = 'VERIFIED' ORDER BY r.createdAt DESC")
    List<Report> findVerifiedReports();
    
    @Query("SELECT r FROM Report r WHERE r.aiVerified = true AND r.aiConfidence > :confidence")
    List<Report> findAiVerifiedReports(@Param("confidence") Double confidence);
    
    @Query("SELECT r FROM Report r ORDER BY r.createdAt DESC")
    List<Report> findAllReportsOrderByDate();
    
    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = :status")
    Long countByStatus(@Param("status") Report.Status status);
    
    List<Report> findBySeverity(Report.Severity severity);
    
    List<Report> findBySeverityAndCategory(Report.Severity severity, Report.Category category);
    
    @Query("SELECT COUNT(r) FROM Report r WHERE r.severity = :severity")
    Long countBySeverity(@Param("severity") Report.Severity severity);
    
    @Query("SELECT r FROM Report r WHERE r.latitude IS NOT NULL AND r.longitude IS NOT NULL ORDER BY r.createdAt DESC")
    List<Report> findReportsWithLocation();
}
