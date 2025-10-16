# CivicChain - Enhanced Civic Issue Reporting Platform

🏙️ **CivicChain is a comprehensive civic issue reporting platform that empowers citizens to report civic problems like potholes, streetlight failures, or garbage issues with photo and location data. The platform features AI verification, community validation, gamification with blockchain token rewards, and MetaMask integration.**

## ✨ Recent Improvements & Fixes

- ✅ **Fixed Color Issues**: Enhanced styling for the "Issues Reported" section with better visual hierarchy and colors
- ✅ **Improved Login System**: Added comprehensive form validation, error handling, and user feedback
- ✅ **Persistent Database**: Configured file-based H2 database for data persistence across application restarts
- ✅ **Sample Data**: Added comprehensive sample data including users, issues, validations, and transactions
- ✅ **MySQL Ready**: Pre-configured MySQL setup script for production deployment
- ✅ **Enhanced UI**: Modern Bootstrap-based interface with improved accessibility and responsive design
- ✅ **Better JDBC**: Optimized database connection pooling and query performance

## 🚀 Quick Start

1. **Start the application**: `mvn spring-boot:run`
2. **Access the web interface**: http://localhost:8080
3. **Login with sample credentials**:
   - **Admin**: `admin` / `admin123` (Full access to admin panel)
   - **User**: `civicuser` / `user123` (Regular user with 150 points, Level 2)
   - **User 2**: `janedoe` / `jane123` (Regular user with 75 points, Level 1)
   - **Authority**: `authority` / `auth123` (Municipal authority with assignment powers)

## 📊 Sample Data Included

- **4 Users**: Admin, 2 regular users, and 1 authority user with different roles and point levels
- **3 Issues**: Including a pothole (assigned to authority), broken streetlight, and illegal parking
- **Validations**: Community votes and authority confirmations
- **Transactions**: Point earning history, token conversions, and validation rewards

## Features

### Core Functionality
- **Issue Reporting**: Citizens can report civic issues with photos, videos, and voice recordings
- **GPS Location**: Automatic location tracking for accurate issue positioning
- **AI Verification**: Demo AI system to verify issue authenticity
- **Community Validation**: Users can validate and vote on reported issues
- **Authority Management**: Admin dashboard for issue management and resolution tracking
- **Gamification**: Points and level system with blockchain token rewards

### Accessibility Features
- **Multi-Modal Input**: Support for photo, video, and voice uploads
- **Screen Reader Compatible**: Semantic HTML and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast Mode**: Support for users with visual impairments

### Blockchain Integration
- **MetaMask Connection**: Connect wallet for token transactions
- **Demo Tokens**: Earn tokens for community participation
- **Testnet Support**: Works with Polygon Mumbai testnet

### User Roles
- **Citizens**: Report issues, validate community reports, earn points
- **Admins**: Manage issues, assign to authorities, track resolutions
- **Authorities**: Receive assignments, update progress, mark as resolved

## Technology Stack

### Backend
- **Spring Boot 3.2.0**: Main framework
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database operations
- **H2 Database**: Development database (MySQL for production)
- **JWT**: Token-based authentication
- **Firebase**: Cloud storage and real-time features

### Frontend
- **Thymeleaf**: Server-side templating
- **Bootstrap 5**: Responsive UI framework
- **Web3.js**: Blockchain integration
- **HTML5 APIs**: Geolocation, Media Recording

### Blockchain
- **Web3j**: Java Ethereum client
- **MetaMask**: Wallet integration
- **Polygon Mumbai**: Testnet for demo

## Setup Instructions

### Prerequisites
- **Java 21 or higher** (Updated from Java 17)
- Maven 3.6+
- Node.js (for frontend dependencies, optional)
- MetaMask browser extension (for blockchain features)
- MySQL 8.0+ (optional, for production)
- Firebase account (optional, for cloud storage)

### 1. Clone and Build
```bash
git clone <repository-url>
# 🏙️ CivicChain - Enhanced AI-Powered Civic Issue Reporting Platform

A modern Spring Boot application for reporting and managing civic issues with AI-powered image verification, interactive maps, and blockchain integration.

## ✨ New Features

### 🧠 AI Issue Verification
- **Firebase ML Kit Integration**: Automatic image classification for civic issues
- **Smart Detection**: Identifies potholes, streetlight failures, garbage collection issues, and more
- **Confidence Scoring**: AI verification with confidence levels and detailed analysis
- **Demo Mode**: Built-in simulation for development and testing

### 🗺️ Interactive Map Dashboard
- **Leaflet.js Integration**: Interactive maps with OpenStreetMap
- **Color-Coded Markers**: Issues displayed by severity (Red=Critical, Orange=Major, Yellow=Moderate, Blue=Minor, Green=Resolved)
- **Heatmap Visualization**: Issue density visualization with weighted importance
- **Advanced Filtering**: Filter by status, type, AI verification, and confidence levels
- **Real-Time Updates**: Auto-refresh every 5 minutes

### 🎨 Modern Frontend
- **Tailwind CSS**: Complete UI overhaul with modern, accessible design
- **Dark Mode Support**: Toggle between light and dark themes with persistence
- **Responsive Design**: Mobile-first approach with excellent mobile UX
- **Improved Accessibility**: Better contrast ratios, keyboard navigation, and screen reader support

### 🔐 Enhanced Authentication
- **Fixed Login Flow**: Proper redirection to dashboard after login
- **Role-Based Dashboards**: Separate dashboards for Admin, Authority, and User roles
- **Improved Readability**: Enhanced form validation and error messaging

### 📊 Smart Analytics
- **Role-Specific Data**: Customized dashboard content based on user role
- **Real-Time Statistics**: Live updates of issue counts, resolution rates, and AI verification
- **Trend Analysis**: Historical data visualization and reporting
- **Performance Metrics**: System health monitoring and statistics

# CivicChain
mvn clean install
```

### 2. Database Configuration

**Development (Default)**: Uses file-based H2 database with persistence
- Data is stored in `./data/civicchain.mv.db`
- H2 Console: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:file:./data/civicchain`
- Username: `sa`, Password: `civicchain123`

**Production (MySQL)**: For production deployment
1. Run the setup script: `mysql -u root -p < setup-mysql.sql`
2. In `application.yml`, uncomment MySQL configuration:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/civicchain?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: civicchain_user
    password: civicchain_password
```

### 3. Firebase Setup (Optional)
1. Create a Firebase project
2. Download service account key
3. Place it in `src/main/resources/firebase-service-account.json`
4. Update Firebase configuration in `application.yml`

### 4. Blockchain Configuration
1. Install MetaMask browser extension
2. Add Polygon Mumbai testnet:
   - Network Name: Polygon Mumbai
   - RPC URL: https://rpc-mumbai.maticvigil.com/
   - Chain ID: 80001
   - Currency: MATIC
3. Get test MATIC from faucet: https://faucet.polygon.technology/

### 5. Run Application
```bash
mvn spring-boot:run
```

The application will be available at: `http://localhost:8080`

## Usage Guide

### For Citizens

#### 1. Registration/Login
- Click "Connect MetaMask" to link your wallet
- Register with username, email, and location preferences
- Login with credentials

#### 2. Report an Issue
- Navigate to "Report Issue" section
- Fill in issue details (title, type, description)
- Set priority and severity levels
- Click "Get Current Location" for GPS coordinates
- Upload photos, videos, or record voice description
- Submit the report

#### 3. Validate Issues
- Browse community issues in "Browse Issues" section
- Vote on issue authenticity
- Earn points for community participation
- View validation history in profile

#### 4. Earn Rewards
- Earn points for reporting issues (10 pts)
- Earn points for validating issues (5 pts)
- Level up automatically (100 points = 1 level)
- Convert points to demo tokens via MetaMask

### For Admins

#### 1. Access Admin Panel
- Login with admin role account
- Access admin panel from user menu
- View dashboard statistics

#### 2. Manage Issues
- Review all reported issues
- Verify AI analysis results
- Assign issues to authorities
- Track resolution progress
- Update issue status

#### 3. User Management
- View user statistics
- Manage user roles and permissions
- Monitor community engagement

### For Authorities

#### 1. Issue Assignment
- Receive assigned issues via email/notification
- View issue details and location
- Update progress status

#### 2. Resolution Tracking
- Mark issues as "In Progress"
- Upload resolution photos
- Complete with resolution notes
- Earn points for successful resolution

## API Documentation

### Authentication Endpoints
```
POST /api/auth/signin - User login
POST /api/auth/signup - User registration  
POST /api/auth/refresh - Refresh JWT token
```

### Issue Management Endpoints
```
GET /api/issues - Get all issues (with filters)
POST /api/issues - Create new issue
GET /api/issues/{id} - Get issue by ID
PUT /api/issues/{id} - Update issue
DELETE /api/issues/{id} - Delete issue (admin only)
```

### Validation Endpoints
```
POST /api/issues/{id}/validate - Validate an issue
GET /api/issues/{id}/validations - Get issue validations
```

### User Endpoints
```
GET /api/users/profile - Get current user profile
PUT /api/users/profile - Update user profile
GET /api/users/leaderboard - Get user leaderboard
POST /api/users/connect-wallet - Connect MetaMask wallet
```

### Admin Endpoints
```
GET /api/admin/stats - Get platform statistics
GET /api/admin/users - Get all users
PUT /api/admin/users/{id}/role - Update user role
GET /api/admin/issues - Get all issues with admin view
```

## Database Schema

### Main Tables
- `users`: User accounts and profiles
- `civic_issues`: Reported civic issues
- `issue_validations`: Community validations
- `issue_comments`: Comments on issues
- `user_transactions`: Points and token transactions

### Relationships
- User -> CivicIssue (one-to-many, reporter)
- User -> IssueValidation (one-to-many)
- CivicIssue -> IssueValidation (one-to-many)
- User -> UserTransaction (one-to-many)

## Security Features

### Authentication
- JWT-based stateless authentication
- BCrypt password hashing
- Role-based access control (RBAC)

### Authorization
- Method-level security with @PreAuthorize
- Resource-based permissions
- Admin and authority role separation

### Data Protection
- Input validation with Bean Validation
- SQL injection prevention with JPA
- XSS protection with Thymeleaf
- CORS configuration for API access

## Testing

### Run Tests
```bash
mvn test
```

### Test Coverage
- Unit tests for services and repositories
- Integration tests for controllers
- Security tests for authentication

## Deployment

### Development
```bash
mvn spring-boot:run
```

### Production
```bash
mvn clean package
java -jar target/civic-chain-0.0.1-SNAPSHOT.jar
```

### Docker (Optional)
```bash
docker build -t civicchain .
docker run -p 8080:8080 civicchain
```

## Configuration

### Environment Variables
```
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:mysql://localhost:3306/civicchain
DATABASE_USERNAME=username
DATABASE_PASSWORD=password
FIREBASE_CONFIG_PATH=firebase-service-account.json
JWT_SECRET=your-secret-key
```

## Troubleshooting

### Common Issues

#### 1. MetaMask Connection Fails
- Ensure MetaMask is installed and unlocked
- Check network configuration (Polygon Mumbai)
- Refresh page and try reconnecting

#### 2. Database Connection Issues
- Verify database credentials in application.yml
- Ensure database server is running
- Check firewall settings

#### 3. File Upload Problems
- Check file size limits in application.yml
- Verify Firebase configuration
- Ensure proper permissions on upload directory

#### 4. AI Verification Not Working
- Currently in demo mode - returns simulated results
- For production, integrate with actual AI service
- Configure API keys in application.yml

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@civicchain.com
- Discord: [Community Server]

## Roadmap

### Phase 1 (Current)
- [x] Basic issue reporting
- [x] User authentication
- [x] MetaMask integration
- [x] Community validation

### Phase 2 (Planned)
- [ ] Real AI verification integration
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] IoT sensor integration
- [ ] Automated issue detection
- [ ] Government API integration
- [ ] Advanced blockchain features

## Acknowledgments

- Bootstrap team for the UI framework
- Spring Boot community
- Web3.js developers
- MetaMask team for wallet integration
- Firebase for backend services