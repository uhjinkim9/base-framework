# uCubers Enterprise Platform - AI Assistant Guide

## Architecture Overview

This is a **microservices-based enterprise platform** with:
- **Frontend**: Next.js 15 client (port 5000) with TypeScript, TipTap editor, FullCalendar, WebSocket/Push notifications
- **Gateway**: Express Gateway (port 10000) with JWT authentication and request routing
- **Microservices**: 10+ NestJS services with dedicated ports:
  - auth:7000, menu:7001, board:7002, draft:7003, plan:7004, poll:7005
  - docs:7006, file:7007, mail:7008, attendance:7009, notification:8000
- **API Gateway**: Alternative Tyk gateway setup in `api-gateway/` for production
- **Real-time**: WebSocket gateway and RabbitMQ messaging for notifications
- **Push Notifications**: Service Worker + Web Push API implementation

## Essential Development Workflow

### Starting the System
```bash
# Initial setup (run once)
.\start.ps1                # Sets Node.js version (20.9.0)
npm install               # Install root dependencies
npm run install-all      # Install all microservice dependencies

# Development (all services)
npm start                 # Starts all services concurrently

# Individual services
npm run start-gateway     # PowerShell script with env var substitution
npm run start-auth        # NestJS with watch mode
npm run start-client      # Next.js with Turbopack
npm run start-notification  # Real-time notification service
npm run start-attendance    # Attendance management service
npm run start-[service]      # Pattern for all microservices
```

### Critical PowerShell Pattern
Gateway startup uses **PowerShell environment variable substitution** (`start-gateway.ps1`):
- Loads `.env.development` variables
- Substitutes `${VAR_NAME}` patterns in YAML config templates
- Generates runtime config files before starting Express Gateway

## Project Conventions

### Port Structure
**Sequential port allocation per service** (documented in main README):
- Client: 5000, Gateway: 10000
- Core Services: 7000-7005 (auth, menu, board, draft, plan, poll)
- Extended Services: 7006-7009 (docs, file, mail, attendance)
- Real-time Services: 8000 (notification with WebSocket/RabbitMQ)

### Microservice Architecture
Each `server/[service]/` follows **NestJS monorepo pattern**:
- `src/` - Application code
- `src/config/env/.env.[environment]` - Service-specific environment variables
- Clean scripts use `rimraf dist` before development startup

### Client-Side Patterns
- **Context-driven state management**: Each domain has dedicated React context (`UserContext.tsx`, `BoardContext.tsx`, etc.)
- **Centralized API service**: `@/util/axios/api-service` with `requestPost()` pattern
- **Local storage utilities**: `@/util/common/storage` with typed getters (`getUserId()`, `getAccessToken()`)
- **Route structure**: `(with-header)/` layout groups for authenticated pages

### Authentication Flow
- **JWT-based** with RS256 signing using `keys/public.pem`
- Client stores tokens in localStorage via `LocalStorage.getAccessToken()`
- Gateway validates all requests except auth endpoints
- CORS configured for `localhost:5000` origin

## Environment Management

### Development Environment
- **Gateway env**: `gateway/.env.development` defines all service URLs
- **Service envs**: Each service has `src/config/env/.env.development`
- **Template substitution**: Gateway configs use `${VAR_NAME}` placeholders

### PM2 Ecosystem
- `ecosystem.development.config.js` - All services with watch mode
- `ecosystem.production.config.js` - Production configuration
- Alternative to `npm start` for process management

## Key Integration Points

### Gateway Routing
`gateway/config/gateway.config.template.yml` defines:
- **API endpoints**: `/auth/*`, `/menu/*`, `/board/*`, `/attendance/*`, `/notification/*`, etc.
- **Service endpoints**: Maps to microservice URLs
- **JWT policies**: Applied to protected endpoints
- **WebSocket gateway**: Real-time notification routing via Socket.IO

### Cross-Service Communication
- Services communicate via **direct HTTP calls** (not through gateway)
- Auth service validates user roles/permissions for other services
- Board service handles file uploads with multipart parsing disabled in gateway
- **Notification service** uses RabbitMQ for event-driven messaging
- **Attendance service** integrates with employee management and policy systems

## Development Tips

### Building/Cleaning
- Use task runner: VS Code tasks for `clean-[service]` operations
- Development startup automatically cleans `dist/` folders
- `rimraf` is the standard clean utility across all services

### Debugging
- `npm run trace-board` - Run board service with trace warnings
- `npm run kill-node-ps` - Kill all Node processes (Windows)
- Individual service debugging via NestJS `--debug` flag

### File Structure Conventions
- **Shared types**: Client has centralized `@/types/` directory
- **Utility functions**: Client uses `@/util/` with categorized subdirectories
- **Component organization**: Domain-specific under `components/src/[domain]/`

## New Features & Services

### Attendance Management System
- **Service**: `server/attendance/` (port 7009)
- **Database**: Employee records, policies, time tracking, attendance logs
- **Features**: Clock in/out, policy management, time calculation, admin interface
- **Frontend**: Admin panels, employee dashboards, calendar integration

### Real-time Notification System
- **Service**: `server/notification/` (port 8000)
- **Technology**: WebSocket (Socket.IO), RabbitMQ messaging, Web Push API
- **Features**: Real-time notifications, push notifications, message queuing
- **Frontend**: Service Worker, push subscription management, real-time updates

### Web Push Implementation
- **Client**: Service Worker (`/public/service-worker.js`)
- **Utilities**: `@/util/webpush.ts` for subscription management
- **Components**: WebPush management UI components
- **Server**: VAPID key management, push notification sending

## Database & Entity Patterns

### Entity Conventions
- **Naming**: snake_case for DB columns (`name` option), camelCase for entity properties
- **Comments**: All entities and columns have descriptive comments
- **Structure**: Consistent use of TypeORM decorators with detailed configuration
- **Example Pattern**:
  ```typescript
  @Column({
    name: "user_name",
    type: "varchar",
    length: 100,
    comment: "사용자 이름",
  })
  userName: string;
  ```

### DTO Validation Patterns
- **Class Validator**: All DTOs use `@IsString()`, `@IsNotEmpty()`, etc.
- **Class Transformer**: `@Type(() => Number)` for proper type conversion
- **Validation Pipe**: Global validation with `transform: true` in main.ts
- **Circular Dependencies**: Use `@Inject(forwardRef(() => Service))` pattern

## Development Best Practices

### Service Dependencies & Injection
- **Circular Dependencies**: Module level `forwardRef(() => Module)` + Service level `@Inject(forwardRef(() => Service))`
- **Entity Repository**: Standard `@InjectRepository(Entity)` pattern
- **Environment Config**: Service-specific `.env.[environment]` files in `src/config/env/`

### Error Handling & Debugging
- **Validation Errors**: Always include validation decorators in DTOs
- **Time Handling**: Use dayjs with proper date/time string parsing
- **NaN Prevention**: Ensure proper number parsing and validation
- **Logging**: Structured logging with NestJS Logger

When modifying this system, respect the **microservice boundaries**, follow the **established port conventions**, ensure proper **environment variable handling** through the PowerShell gateway startup process, and maintain **entity/DTO consistency** with validation decorators.
