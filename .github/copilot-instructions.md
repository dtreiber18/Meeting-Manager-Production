<!-- Meeting Manager - Enterprise Application Setup -->

## Project Overview
- **Product Name**: Meeting Manager
- **Architecture**: Angular 17+ Frontend + Spring Boot 3.x Backend
- **Target Platform**: Azure Container Apps with enterprise-grade monitoring
- **Authentication**: Azure AD B2C with RBAC
- **AI Integration**: Azure OpenAI, Speech Services, Text Analytics, Form Recognizer

## G37 Enterprise Technology Stack
- **Frontend**: Angular 17+ with TypeScript, Angular Material, PWA, PrimeNG
- **Backend**: Java 17+ with Spring Boot 3.x, Spring Security, Spring Data JPA
- **Databases**: MongoDB (document data) and MySQL (relational data)
- **Cloud**: Azure (Container Apps, Key Vault, Storage, OpenAI)
- **Auth**: Azure AD B2C with RBAC
- **Monitoring**: Application Insights, Azure Monitor, Log Analytics
- **Security**: Azure Security Center, Key Vault, Managed Identity
- **Testing**: JUnit 5, Test containers, Cypress, SonarQube, OWASP ZAP

## Development Guidelines
- Use enterprise-grade patterns and practices
- Implement proper error handling and logging
- Follow Azure Well-Architected Framework principles
- Ensure scalability for thousands of users
- Maintain clean architecture with separation of concerns
- Use dependency injection and proper service layers

## AI Services Integration Priority
1. Azure OpenAI (chatbot/AI features)
2. Cognitive Search (content indexing) 
3. Speech Services (voice interaction)
4. Language Services (text analysis)
5. Form Recognizer (document processing)
6. Text Analytics (content analysis)

## Setup Progress
- [x] ✅ Project Requirements Clarified
- [x] ✅ Workspace Structure Created
- [x] ✅ Scaffold Angular Frontend Project (Angular 17+ with Material + PrimeNG)
- [x] ✅ Scaffold Spring Boot Backend Project (Java 17 + Spring Boot 3.x)
- [x] ✅ Setup Azure Infrastructure Configuration (Bicep templates)
- [x] ✅ Configure Development Environment (Docker Compose)
- [x] ✅ Setup CI/CD Pipeline Configuration (GitHub Actions)
- [x] ✅ Create AI Chat Assistant (Context-aware intelligent assistant)
- [ ] Create Database Schemas and Models
- [ ] Implement Authentication Integration
- [ ] Setup Monitoring and Logging
- [x] ✅ Create Documentation (README.md)