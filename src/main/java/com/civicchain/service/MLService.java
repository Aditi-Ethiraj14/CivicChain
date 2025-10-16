package com.civicchain.service;

import com.civicchain.model.Report;
import com.civicchain.repository.ReportRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.concurrent.CompletableFuture;

@Service
public class MLService {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Async
    public CompletableFuture<Void> verifyReportAsync(Report report) {
        try {
            verifyReport(report);
        } catch (Exception e) {
            System.err.println("Async ML verification failed for report " + report.getId() + ": " + e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }
    
    public void verifyReport(Report report) {
        if (report.getImagePath() == null) {
            return;
        }
        
        try {
            // Prepare the request
            String url = mlServiceUrl + "/verify";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Add image file
            File imageFile = new File("uploads/" + report.getImagePath());
            if (imageFile.exists()) {
                body.add("image_file", new FileSystemResource(imageFile));
                body.add("category", report.getCategory().name());
                
                HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
                
                // Make the request
                ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
                
                if (response.getStatusCode() == HttpStatus.OK) {
                    // Parse response
                    JsonNode jsonResponse = objectMapper.readTree(response.getBody());
                    
                    // Update report with AI results
                    report.setAiVerified(jsonResponse.get("ai_verified").asBoolean());
                    report.setAiConfidence(jsonResponse.get("confidence").asDouble());
                    report.setAiPrediction(jsonResponse.get("prediction").asText());
                    
                    // Auto-verify if AI confidence is high
                    if (report.getAiVerified() && report.getAiConfidence() > 0.8) {
                        report.setStatus(Report.Status.VERIFIED);
                        report.setVerified(true);
                    }
                    
                    reportRepository.save(report);
                    System.out.println("AI verification completed for report " + report.getId() + 
                        " - Verified: " + report.getAiVerified() + 
                        ", Confidence: " + report.getAiConfidence());
                }
            } else {
                System.err.println("Image file not found: " + imageFile.getPath());
            }
            
        } catch (Exception e) {
            System.err.println("ML service verification failed: " + e.getMessage());
            // Set default values on failure
            report.setAiVerified(false);
            report.setAiConfidence(0.0);
            report.setAiPrediction("Verification failed");
            reportRepository.save(report);
        }
    }
    
    public boolean isMLServiceHealthy() {
        try {
            String url = mlServiceUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }
}