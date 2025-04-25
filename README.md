# Web Application Project

A secure, feature-rich web application with user authentication, role-based access control, and comprehensive user management capabilities.

## Features

- **User Authentication**
  - JWT-based authentication
  - Email verification
  - Password reset functionality
  - Two-factor authentication
  - Secure session management

- **Role-Based Access Control**
  - User, Moderator, and Admin roles
  - Permission-based access to resources
  - Protected routes and API endpoints

- **User Dashboard**
  - Personalized user dashboard
  - Activity tracking and logging
  - User profile management
  - Security settings

- **Admin Panel**
  - User management (CRUD operations)
  - User activity monitoring
  - System statistics and analytics

## Tech Stack

### Frontend
- React.js with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Recharts for data visualization

### Backend
- Spring Boot (Java)
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL database
- Thymeleaf for email templates

### DevOps
- Docker and Docker Compose
- Nginx for reverse proxy

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Docker and Docker Compose
- PostgreSQL (if running without Docker)

## Installation and Setup

### Using Docker (Recommended)

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/webappproject.git
   cd webappproject
   \`\`\`

2. Start the application using Docker Compose:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Configure the database in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/webapp
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   \`\`\`

3. Build and run the Spring Boot application:
   \`\`\`bash
   ./mvnw spring-boot:run
   \`\`\`

#### Frontend Setup

1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Default Credentials

After starting the application, you can log in with the following default admin account:

- Username: `admin`
- Password: `admin`

## Project Structure

\`\`\`
webappproject/
├── backend/                  # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/        # Java source files
│   │   │   └── resources/   # Configuration and templates
│   │   └── test/            # Test files
│   ├── mvnw                 # Maven wrapper
│   ├── pom.xml              # Maven dependencies
│   └── Dockerfile           # Backend Docker configuration
│
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/                 # React source files
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   └── services/        # API services
│   ├── package.json         # NPM dependencies
│   └── Dockerfile           # Frontend Docker configuration
│
├── docker-compose.yml       # Docker Compose configuration
├── README.md                # Project documentation
└── docs/                    # Additional documentation
    ├── api-docs.md          # API documentation
    └── user-roles.md        # User roles and permissions
\`\`\`



