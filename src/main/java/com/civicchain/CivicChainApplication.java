package com.civicchain;

import com.civicchain.model.User;
import com.civicchain.model.Report;
import com.civicchain.repository.UserRepository;
import com.civicchain.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CivicChainApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ReportRepository reportRepository;

    public static void main(String[] args) {
        SpringApplication.run(CivicChainApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🚀 CivicChain starting with clean database...");
            
            // Only create admin user if none exists
            if (userRepository.count() == 0) {
                User adminUser = new User("admin", "admin@civicchain.com", "admin123");
                adminUser.setRole(User.Role.ADMIN);
                adminUser.setXp(0);
                userRepository.save(adminUser);
                System.out.println("✅ Created initial admin user: admin / admin123");
                System.out.println("ℹ️ Ready for real users and reports!");
            } else {
                System.out.println("ℹ️ Database contains " + userRepository.count() + " users and " + reportRepository.count() + " reports");
            }
        } catch (Exception e) {
            System.err.println("Error during startup: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
