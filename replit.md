# Document Management System

## Overview

This is a full-stack document management system built for organizational compliance and document tracking. The application allows users to upload, manage, and track documents with deadline management, automated reminders, and administrative oversight. It features user authentication, role-based access control, file uploads with Firebase Storage, and email notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with React 18 using TypeScript and Vite for fast development
- **UI Framework**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **State Management**: TanStack Query for server state, React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Express.js Server**: RESTful API with TypeScript and ES modules
- **Database Layer**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **File Storage**: Firebase Storage for document uploads with multipart handling
- **Authentication**: Firebase Auth integration with custom user profiles
- **Email Service**: Nodemailer for automated notifications and reminders
- **Development Setup**: Vite middleware integration for seamless full-stack development

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for schema management
- **File Storage**: Firebase Cloud Storage for document files
- **Database Schema**: Five main entities - users, documents, deadlines, notifications, and reminders
- **Session Management**: Session-based authentication with PostgreSQL session store
- **Database Migrations**: Drizzle Kit for schema versioning and deployments

### Authentication & Authorization
- **Firebase Authentication**: Primary auth provider with email/password
- **Role-Based Access**: User and admin roles with different permission levels
- **Session Management**: Server-side session handling with connect-pg-simple
- **Profile Integration**: Custom user profiles stored in PostgreSQL linked to Firebase UIDs
- **Protected Routes**: Client-side route protection based on authentication state

### External Dependencies
- **Firebase Services**: 
  - Firebase Auth for user authentication
  - Firebase Storage for file uploads and document storage
  - Firebase Admin SDK for server-side operations
- **Database**: 
  - PostgreSQL as primary database (configured for Neon serverless)
  - Connection via @neondatabase/serverless driver
- **Email Service**: 
  - Nodemailer for SMTP email delivery
  - Configurable SMTP settings for notifications and reminders
- **Development Tools**:
  - Replit integration with cartographer and runtime error modal
  - TypeScript for type safety across the stack
  - ESBuild for production bundling