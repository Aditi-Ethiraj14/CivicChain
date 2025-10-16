package com.civicchain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reports")
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 200)
    private String title;
    
    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private Category category;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    
    @Enumerated(EnumType.STRING)
    private Severity severity = Severity.MODERATE;
    
    private String imagePath;
    private String audioPath;
    
    private Double latitude;
    private Double longitude;
    private String location;
    
    // AI Verification
    private Double aiConfidence;
    private String aiPrediction;
    private Boolean aiVerified = false;
    
    // Community Verification
    private Integer upvotes = 0;
    private Integer downvotes = 0;
    private Boolean verified = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "reports", "verifications"})
    private User reporter;
    
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"report", "user"})
    private List<Verification> verifications;
    
    public enum Category {
        POTHOLE, GARBAGE, STREETLIGHT, FLOOD, TRAFFIC, VANDALISM, OTHER
    }
    
    public enum Status {
        PENDING, VERIFIED, REJECTED, IN_PROGRESS, RESOLVED
    }
    
    public enum Severity {
        MINOR, MODERATE, MAJOR, CRITICAL
    }
    
    // Constructors
    public Report() {}
    
    public Report(String title, String description, Category category) {
        this.title = title;
        this.description = description;
        this.category = category;
    }
    
    // Helper methods
    public boolean isAutoVerifiable() {
        return (aiVerified && aiConfidence > 0.9) || (upvotes >= 2 && upvotes > downvotes);
    }
    
    public void addUpvote() {
        this.upvotes++;
        if (isAutoVerifiable()) {
            this.status = Status.VERIFIED;
            this.verified = true;
        }
    }
    
    public void addDownvote() {
        this.downvotes++;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Category getCategory() {
        return category;
    }
    
    public void setCategory(Category category) {
        this.category = category;
    }
    
    public Status getStatus() {
        return status;
    }
    
    public void setStatus(Status status) {
        this.status = status;
    }
    
    public String getImagePath() {
        return imagePath;
    }
    
    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }
    
    public String getAudioPath() {
        return audioPath;
    }
    
    public void setAudioPath(String audioPath) {
        this.audioPath = audioPath;
    }
    
    public Double getLatitude() {
        return latitude;
    }
    
    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }
    
    public Double getLongitude() {
        return longitude;
    }
    
    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public Double getAiConfidence() {
        return aiConfidence;
    }
    
    public void setAiConfidence(Double aiConfidence) {
        this.aiConfidence = aiConfidence;
    }
    
    public String getAiPrediction() {
        return aiPrediction;
    }
    
    public void setAiPrediction(String aiPrediction) {
        this.aiPrediction = aiPrediction;
    }
    
    public Boolean getAiVerified() {
        return aiVerified;
    }
    
    public void setAiVerified(Boolean aiVerified) {
        this.aiVerified = aiVerified;
    }
    
    public Integer getUpvotes() {
        return upvotes;
    }
    
    public void setUpvotes(Integer upvotes) {
        this.upvotes = upvotes;
    }
    
    public Integer getDownvotes() {
        return downvotes;
    }
    
    public void setDownvotes(Integer downvotes) {
        this.downvotes = downvotes;
    }
    
    public Boolean getVerified() {
        return verified;
    }
    
    public void setVerified(Boolean verified) {
        this.verified = verified;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public User getReporter() {
        return reporter;
    }
    
    public void setReporter(User reporter) {
        this.reporter = reporter;
    }
    
    public List<Verification> getVerifications() {
        return verifications;
    }
    
    public void setVerifications(List<Verification> verifications) {
        this.verifications = verifications;
    }
    
    public Severity getSeverity() {
        return severity;
    }
    
    public void setSeverity(Severity severity) {
        this.severity = severity;
    }
}
