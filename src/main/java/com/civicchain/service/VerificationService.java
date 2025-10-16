package com.civicchain.service;

import com.civicchain.model.Report;
import com.civicchain.model.User;
import com.civicchain.model.Verification;
import com.civicchain.repository.ReportRepository;
import com.civicchain.repository.VerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VerificationService {
    
    @Autowired
    private VerificationRepository verificationRepository;
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private UserService userService;
    
    public List<Verification> getVerificationsByReport(Report report) {
        return verificationRepository.findByReport(report);
    }
    
    public List<Verification> getVerificationsByUser(User user) {
        return verificationRepository.findByUser(user);
    }
    
    public Verification submitVerification(Long userId, Long reportId, Verification.VoteType vote, String comment) {
        User user = userService.getUserById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        
        // Check if user already voted on this report
        if (verificationRepository.existsByUserAndReport(user, report)) {
            throw new RuntimeException("User has already voted on this report");
        }
        
        // Create verification
        Verification verification = new Verification(vote, user, report);
        verification.setComment(comment);
        Verification saved = verificationRepository.save(verification);
        
        // Update report vote counts
        if (vote == Verification.VoteType.UPVOTE) {
            report.addUpvote();
        } else {
            report.addDownvote();
        }
        reportRepository.save(report);
        
        // Award XP to user for verification
        userService.addXpToUser(userId, 5);
        
        return saved;
    }
    
    public boolean hasUserVoted(Long userId, Long reportId) {
        User user = userService.getUserById(userId).orElse(null);
        Report report = reportRepository.findById(reportId).orElse(null);
        
        if (user == null || report == null) {
            return false;
        }
        
        return verificationRepository.existsByUserAndReport(user, report);
    }
    
    public boolean hasUserVotedOnReport(Long userId, Long reportId) {
        return hasUserVoted(userId, reportId);
    }
    
    public Verification getUserVoteForReport(Long userId, Long reportId) {
        User user = userService.getUserById(userId).orElse(null);
        Report report = reportRepository.findById(reportId).orElse(null);
        
        if (user == null || report == null) {
            return null;
        }
        
        return verificationRepository.findByUserAndReport(user, report).orElse(null);
    }
    
    public Verification saveVerification(Verification verification) {
        return verificationRepository.save(verification);
    }
    
    public Long getUpvoteCount(Report report) {
        return verificationRepository.countUpvotesByReport(report);
    }
    
    public Long getDownvoteCount(Report report) {
        return verificationRepository.countDownvotesByReport(report);
    }
}