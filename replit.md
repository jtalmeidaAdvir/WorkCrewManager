# ConstructPro - Construction Management System

## Overview

ConstructPro is a full-stack construction management web application built with a modern TypeScript stack. The system enables construction companies to manage projects (obras), track worker time attendance, create daily reports, and organize teams. It features role-based access control with three user types: Trabalhador (Worker), Encarregado (Supervisor), and Diretor (Director).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom construction-themed color palette
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with role-based access control middleware

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **User Management**: Automatic user creation/update on authentication
- **Role-Based Access**: Three-tier permission system (Trabalhador/Encarregado/Diretor)

### Core Business Entities
1. **Users**: User profiles with role assignments and authentication data
2. **Obras (Projects)**: Construction projects with QR codes for location verification
3. **Registo Ponto (Time Tracking)**: GPS and QR code-enabled time clock system
4. **Equipas (Teams)**: Project-based team organization with supervisor assignments
5. **Partes Diárias (Daily Reports)**: Detailed daily activity reporting with categories

### Frontend Components
- **Layout System**: Responsive design with mobile-first navigation
- **Form Components**: Reusable form components with validation
- **QR Scanner**: QR code scanning functionality for location verification
- **Dashboard**: Role-specific dashboard with quick actions and statistics
- **Mobile Navigation**: Bottom navigation bar for mobile devices

## Data Flow

### Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect handles authentication with Replit
3. User information is stored/updated in PostgreSQL
4. Session is created and stored in database
5. Role-based access control determines available features

### Time Tracking Flow
1. Worker scans QR code to verify location at construction site
2. GPS coordinates are captured for additional verification
3. Clock-in/clock-out events are recorded with timestamps
4. Daily time records are aggregated for reporting

### Team Management Flow
1. Directors create new teams and assign projects
2. Supervisors (Encarregados) are assigned to manage teams
3. Workers are added to teams for specific projects
4. Team assignments determine access to project-specific features

### Daily Reports Flow
1. Workers and supervisors create daily activity reports
2. Reports are categorized (Materials, Labor, Equipment)
3. Quantities, hours, and descriptions are recorded
4. Reports are linked to specific projects and dates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Headless UI component library
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Build tool and development server
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit integration
- **tsx**: TypeScript execution for development

### Authentication Dependencies
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL with environment-based connection strings
- **Authentication**: Replit Auth with development configuration
- **Error Handling**: Runtime error overlay for development debugging

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production
- **Database**: Production PostgreSQL connection via DATABASE_URL environment variable

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption secret (required)
- **REPL_ID**: Replit application identifier
- **ISSUER_URL**: OpenID Connect issuer URL (defaults to Replit)
- **REPLIT_DOMAINS**: Allowed domains for authentication

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Added user role switching functionality for testing different user types (Trabalhador, Encarregado, Diretor)
- July 01, 2025. Implemented complete user management system allowing directors to create and manage workers, supervisors, and other directors through dedicated UI
- July 01, 2025. Fixed team creation system to use real users from database instead of hardcoded fictional users
- July 01, 2025. MIGRATED from Replit Auth to local authentication system with username/password login, director can create users and see generated credentials to distribute manually
- July 01, 2025. Added password reset functionality allowing directors to generate new passwords for existing users and view the new credentials
- July 01, 2025. Added .env file with SQL Server configuration for automatic table creation
- July 01, 2025. Improved QR scanner camera functionality with detailed error handling and mobile device support
- July 01, 2025. Fixed timezone issues - all time tracking now uses Europe/Lisbon timezone correctly
- July 01, 2025. NOTE: Currently using memory storage - data is lost on server restart. To persist data, need PostgreSQL database or SQL Server connection
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```