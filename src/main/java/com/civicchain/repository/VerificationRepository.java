package com.civicchain.repository;

import com.civicchain.model.Verification;
import com.civicchain.model.Report;
import com.civicchain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, Long> {
    
    List<Verification> findByReport(Report report);
    
    List<Verification> findByUser(User user);
    
    Optional<Verification> findByUserAndReport(User user, Report report);
    
    @Query("SELECT COUNT(v) FROM Verification v WHERE v.report = :report AND v.vote = 'UPVOTE'")
    Long countUpvotesByReport(@Param("report") Report report);
    
    @Query("SELECT COUNT(v) FROM Verification v WHERE v.report = :report AND v.vote = 'DOWNVOTE'")
    Long countDownvotesByReport(@Param("report") Report report);
    
    Boolean existsByUserAndReport(User user, Report report);
    
    // Additional methods for API support
    boolean existsByUserIdAndReportId(Long userId, Long reportId);
    
    Verification findByUserIdAndReportId(Long userId, Long reportId);
    
    List<Verification> findByReportId(Long reportId);
    
    List<Verification> findByUserId(Long userId);
}