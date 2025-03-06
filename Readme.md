# Metropolia Attendance Application

> A comprehensive attendance tracking solution developed for Metropolia University of Applied Sciences to streamline lecture attendance management and enhance educational administrative processes.

[![Commit Activity](https://img.shields.io/github/commit-activity/m/Krugou/JakSurveillance)](https://github.com/Krugou/JakSurveillance)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933.svg)](https://nodejs.org/)

## 🔗 Links

- [Production Frontend](https://attend.metropolia.fi/)
- [API Endpoint](https://attend.metropolia.fi/api/)
- [TypeScript Documentation](https://krugou.github.io/attenddotmetropoliadotfi/)

## 📋 Project Overview

The Metropolia Attendance application enables instructors to efficiently record student presence in lectures through multiple authentication methods:

- QR code scanning
- Manual attendance recording
- Student self-registration
- Microsoft Entra ID (Azure AD) authentication

The system provides detailed analytics, reporting features, and integration with Metropolia's curriculum data through the Open Data API.

## 🚀 Getting Started

For detailed setup instructions, development environment configuration, and deployment guides, see:

[How to Start](HowToStart.md)

## 🏗️ Architecture

The application follows a modern web architecture:

- **Frontend**: React with TypeScript, Tailwind CSS for styling
- **Backend**: Node.js with Express, TypeScript
- **Database**: MariaDB
- **Authentication**: JWT tokens, Microsoft Entra ID integration
- **API**: RESTful endpoints with OpenAPI documentation

## 🛡️ Security and Best Practices

This project adheres to industry best practices:

- Secure authentication with proper JWT handling
- Input validation and sanitization
- CORS security policies
- Role-based access control
- Data encryption for sensitive information
- Regular security audits and updates

## 🌐 Internationalization

The application supports multiple languages:

- Finnish
- English
- Swedish

Translations are managed through i18next with proper localization patterns.

## 🛠️ Development

### Prerequisites

- Node.js (LTS version)
- MariaDB
- API keys (Metropolia Open Data API)
- Microsoft Entra ID credentials

### Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: MariaDB
- **Documentation**: TypeDoc, OpenAPI
- **Testing**: Jest, Playwright

## 📝 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [System Architecture](./DOCUMENTATION.md)

## 📊 Monitoring and Maintenance

The application uses PM2 for process management and includes comprehensive logging for troubleshooting and performance monitoring.

## 👥 Contributors

- Developed by Metropolia University of Applied Sciences students and faculty.

---

© 2023 Metropolia University of Applied Sciences
