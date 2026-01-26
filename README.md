<<<<<<< HEAD
# AURORA OPS – Real-Time Business Operations & Intelligence Platform

## 🚀 Production-Ready SaaS Platform

Aurora Ops is a **fully working**, production-ready, multi-tenant SaaS platform for real-time business operations management, designed with enterprise-grade architecture and security.

**Status:** ✅ **FULLY FUNCTIONAL** - All services running, authenticated, tested, and production-ready.

---

## 🎯 Project Summary (2026)

This project is a real-time SaaS platform for business operations, project, and task management. It features:
- Multi-tenant organizations with role-based access (owner, admin, member, viewer)
- Real-time updates (Socket.IO)
- Professional, modern UI (Next.js, Tailwind, ShadCN)
- Soft delete for all major entities
- Localization (language/timezone)
- Secure authentication (JWT, refresh tokens, Redis)
- Dockerized for easy deployment

**Tested:** All features (registration, login, CRUD, real-time, role management, soft delete, profile, preferences) are working as of January 2026.

**Portfolio/Recruiter Note:**
This project demonstrates full-stack, real-time, and SaaS skills. It is suitable for job applications in the UAE and globally. For best results, deploy a live demo and document your contributions.

---

---

## ⚡ Quick Start

```powershell
# Clone and navigate
cd C:\aurora-ops

# Start all services (Docker required)
docker-compose up -d

# Check status
docker-compose ps

# Access the application
# App:      http://localhost:3000
# Backend:  http://localhost:5000/api
# Health:   http://localhost:5000/health
```


**That's it!** The app is running. Open http://localhost:3000 to register and login.

---

## 👤 Roles & Permissions

Supported roles: **owner**, **admin**, **member**, **viewer**
- New users are assigned the "member" role by default.
- Admins/owners can change roles in the organization members page.
- Permissions are enforced for all major actions (invite, edit, delete, etc.).
- The dashboard UI is the same for all roles, but permissions restrict actions.

---

📖 For detailed documentation, see [`FULL_WORKING_PROJECT_GUIDE.md`](./FULL_WORKING_PROJECT_GUIDE.md)

---

## 🏗️ System Architecture (Tech Stack)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  Next.js App Router │ TypeScript │ Tailwind │ ShadCN UI         │
│  TanStack Query │ Zustand │ Socket.IO Client │ Zod              │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                    │
│  SSL Termination │ Load Balancing │ Rate Limiting               │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│  Express.js │ TypeScript │ JWT Auth │ RBAC                      │
│  Rate Limiting │ Validation │ Security Middleware               │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────┬──────────────────────┬──────────────────┐
│   Business Logic     │   Real-Time Layer    │   Job Queue      │
│   Controllers        │   Socket.IO Server   │   BullMQ         │
│   Services           │   Event Emitters     │   Workers        │
│   Permissions        │   Presence Tracking  │   Scheduled Jobs │
└──────────────────────┴──────────────────────┴──────────────────┘
                              ↕
┌──────────────────────┬──────────────────────┬──────────────────┐
│   MongoDB            │   Redis Cache        │   External APIs  │
│   Multi-tenant DB    │   Session Store      │   Stripe         │
│   Indexed Collections│   Rate Limit Store   │   Email Service  │
│   Audit Logs         │   WebSocket State    │   Notifications  │
└──────────────────────┴──────────────────────┴──────────────────┘
```

### Data Flow

1. **Authentication Flow**
   - User submits credentials → Backend validates → JWT issued
   - Access token (15min) + Refresh token (7 days)
   - Refresh tokens stored in Redis with session tracking
   - Secure httpOnly cookies for web clients

2. **Multi-Tenant Isolation**
   - Organization-based tenant isolation
   - All queries filtered by organizationId
   - Middleware enforces tenant context
   - No cross-tenant data leakage

3. **Real-Time Updates**
   - Client connects via Socket.IO with JWT
   - Server validates and joins organization rooms
   - Events broadcast to specific organization/user rooms
   - Optimistic UI updates with server reconciliation

4. **Request Pipeline**
   ```
   Request → Rate Limit → Auth → RBAC → Validation → Controller
   → Service → Database → Response → Audit Log
   ```

## 📁 Project Structure (Key Folders)

```
aurora-ops/
├── client/                      # Next.js Frontend
│   ├── app/
│   │   ├── (public)/           # Public pages (marketing)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── pricing/
│   │   │   ├── security/
│   │   │   ├── terms/
│   │   │   └── privacy/
│   │   ├── (auth)/             # Auth pages
│   │   │   ├── forgot-password/
│   │   ├── (onboarding)/       # Onboarding flow
│   │   │   ├── onboarding/
│   │   │   ├── create-organization/
│   │   │   ├── invite-team/
│   │   │   │   ├── settings/
│   │   │   │   ├── members/
│   │   │   │   ├── roles/
│   │   │   │   └── audit-logs/
│   │   │   ├── projects/
│   │   │   │   └── [projectId]/
│   │   │   │   └── [taskId]/
│   │   │   │   └── [clientId]/
│   │   │   ├── billing/
│   │   │   │   ├── invoices/
│   │   │   │   └── subscription/
│   │   │   ├── admin/
│   │   │   │   ├── metrics/
│   │   │   │   ├── security/
│   │   │   │   └── system-health/
│   │   │   └── profile/
│   │   │       ├── security/
│   │   │       └── sessions/
│   │   ├── 403.tsx
│   │   ├── 404.tsx
│   │   ├── 500.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # ShadCN components
│   │   ├── layouts/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── shared/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── auth.service.ts
│   │   └── storage.service.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   └── notificationStore.ts
│   ├── lib/
│   │   ├── socket-client.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── .env.local
│   ├── .env.production
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── src/
│   │   ├── app.ts              # Express app setup
│   │   ├── server.ts           # Server entry point
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   └── seed.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Organization.ts
│   │   │   ├── Membership.ts
│   │   │   ├── Role.ts
│   │   │   ├── Permission.ts
│   │   │   ├── Project.ts
│   │   │   ├── Task.ts
│   │   │   ├── Comment.ts
│   │   │   ├── Activity.ts
│   │   │   ├── Notification.ts
│   │   │   ├── Client.ts
│   │   │   ├── Invoice.ts
│   │   │   ├── Subscription.ts
│   │   │   ├── AuditLog.ts
│   │   │   └── Session.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── organization.controller.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── task.controller.ts
│   │   │   ├── client.controller.ts
│   │   │   ├── billing.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── organization.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── task.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── email.service.ts
│   │   │   ├── stripe.service.ts
│   │   │   └── audit.service.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── organization.routes.ts
│   │   │   ├── project.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   ├── client.routes.ts
│   │   │   ├── billing.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── user.routes.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rbac.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── audit.middleware.ts
│   │   ├── sockets/
│   │   │   ├── socket.ts
│   │   │   ├── handlers/
│   │   │   │   ├── dashboard.handler.ts
│   │   │   │   ├── notification.handler.ts
│   │   │   │   ├── task.handler.ts
│   │   │   │   └── presence.handler.ts
│   │   │   └── middleware/
│   │   │       └── auth.socket.middleware.ts
│   │   ├── jobs/
│   │   │   ├── queue.ts
│   │   │   ├── workers/
│   │   │   │   ├── email.worker.ts
│   │   │   │   ├── notification.worker.ts
│   │   │   │   └── analytics.worker.ts
│   │   │   └── schedulers/
│   │   │       └── subscription.scheduler.ts
│   │   ├── permissions/
│   │   │   ├── definitions.ts
│   │   │   └── checker.ts
│   │   ├── validations/
│   │   │   ├── auth.validation.ts
│   │   │   ├── organization.validation.ts
│   │   │   ├── project.validation.ts
│   │   │   └── task.validation.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── errors.ts
│   │   │   └── helpers.ts
│   │   └── types/
│   │       ├── index.ts
│   │       ├── auth.types.ts
│   │       └── socket.types.ts
│   ├── .env
│   ├── .env.production
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── .gitignore
├── .env.example
└── README.md
```

## 🔐 Security Features

### Authentication
- bcrypt password hashing (12 rounds)
- JWT with RS256 algorithm
- Access tokens (15 min expiry)
- Refresh tokens (7 days, rotated on use)
- Secure httpOnly cookies
- CSRF protection

### Authorization
- Role-Based Access Control (RBAC)
- Fine-grained permissions
- Tenant isolation
- Resource-level permissions
- Permission inheritance

### API Security
- Rate limiting (100 req/15min per IP)
- Request validation (Zod schemas)
- SQL injection prevention (Mongoose)
- XSS protection (Helmet)
- CORS configuration
- Security headers

### Data Protection
- Data encryption at rest
- TLS/SSL in transit
- Sensitive data masking in logs
- Audit trail for all actions
- GDPR compliance ready

## 🎯 Real-Time Features

### WebSocket Events

#### Client → Server
- `join:organization` - Join organization room
- `task:update` - Update task status
- `presence:online` - Mark user online
- `typing:start` - User typing indicator

#### Server → Client
- `dashboard:update` - Dashboard metrics updated
- `notification:new` - New notification
- `task:updated` - Task state changed
- `activity:new` - New activity in feed
- `user:presence` - User online/offline
- `project:updated` - Project changes

### Real-Time Components
- Live dashboard metrics
- Instant notifications
- Task status updates
- Online presence indicators
- Activity feed streaming
- Comment updates
- Project collaboration

## 🗄️ Database Design

### Core Collections

#### Users
```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (hashed),
  firstName: string,
  lastName: string,
  avatar: string,
  isEmailVerified: boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null
}
```

#### Organizations
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique, indexed),
  plan: 'free' | 'pro' | 'enterprise',
  settings: object,
  createdBy: ObjectId → User,
  createdAt: Date,
  updatedAt: Date
}
```

#### Memberships
```typescript
{
  _id: ObjectId,
  userId: ObjectId → User (indexed),
  organizationId: ObjectId → Organization (indexed),
  roleId: ObjectId → Role,
  status: 'active' | 'invited' | 'suspended',
  invitedBy: ObjectId → User,
  joinedAt: Date,
  createdAt: Date
}
```

#### Projects
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId (indexed),
  name: string,
  description: string,
  status: 'active' | 'archived',
  ownerId: ObjectId → User,
  members: [ObjectId → User],
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks
```typescript
{
  _id: ObjectId,
  organizationId: ObjectId (indexed),
  projectId: ObjectId (indexed),
  title: string,
  description: string,
  status: 'todo' | 'in_progress' | 'review' | 'done',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  assigneeId: ObjectId → User,
  createdBy: ObjectId → User,
  dueDate: Date,
  tags: [string],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- Compound index: (organizationId, createdAt)
- Text search indexes on searchable fields
- TTL indexes for sessions and temporary data
- Unique indexes for email, slug fields

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB 7+ (local or cloud)
- Redis 7+
- Stripe account (for billing)

### Environment Variables

Create `.env` files in both `client/` and `server/`:

**server/.env**
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://mongodb:27017/aurora-ops
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@auroraops.com
```

**client/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Installation & Running

#### Development Mode

```bash
# Clone repository
git clone <repository-url>
cd aurora-ops

# Install dependencies
cd server && npm install
cd ../client && npm install

# Start with Docker Compose
docker-compose up -d

# Or start manually
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

#### Production Deployment

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d

# Or build manually
cd server && npm run build
cd ../client && npm run build

# Start with PM2
pm2 start ecosystem.config.js
```

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
POST   /api/auth/refresh           Refresh access token
POST   /api/auth/logout            Logout user
POST   /api/auth/forgot-password   Request password reset
POST   /api/auth/reset-password    Reset password
GET    /api/auth/me                Get current user
```

### Organization Endpoints

```
GET    /api/organizations          Get user's organizations
POST   /api/organizations          Create organization
GET    /api/organizations/:id      Get organization details
PUT    /api/organizations/:id      Update organization
DELETE /api/organizations/:id      Delete organization
GET    /api/organizations/:id/members    Get members
POST   /api/organizations/:id/invite     Invite member
```

### Project Endpoints

```
GET    /api/projects               Get projects
POST   /api/projects               Create project
GET    /api/projects/:id           Get project details
PUT    /api/projects/:id           Update project
DELETE /api/projects/:id           Delete project
```

### Task Endpoints

```
GET    /api/tasks                  Get tasks
POST   /api/tasks                  Create task
GET    /api/tasks/:id              Get task details
PUT    /api/tasks/:id              Update task
DELETE /api/tasks/:id              Delete task
POST   /api/tasks/:id/comments     Add comment
```

[See full API documentation at /docs/api.md]

## 🏢 Multi-Tenancy

### Tenant Isolation Strategy

1. **Organization-based tenancy**: Each organization is a separate tenant
2. **Data isolation**: All queries filtered by `organizationId`
3. **Middleware enforcement**: `tenantMiddleware` extracts and validates tenant
4. **No shared data**: Complete isolation between organizations
5. **Performance**: Indexed queries by organizationId

### Tenant Context Flow

```typescript
Request → Auth Middleware → Extract User → Get Membership 
→ Set Organization Context → Controller (with orgId)
```

## 📊 Scaling Strategy

### Horizontal Scaling

1. **Stateless API servers**: Scale API instances behind load balancer
2. **Socket.IO with Redis adapter**: Multi-instance WebSocket support
3. **MongoDB replica set**: High availability and read scaling
4. **Redis cluster**: Distributed caching and session storage

### Vertical Optimization

1. **Database indexing**: Compound indexes on common queries
2. **Query optimization**: Lean queries, projection, pagination
3. **Caching strategy**: Redis for frequently accessed data
4. **CDN**: Static assets served via CDN

### Performance Targets

- API response time: < 100ms (p95)
- WebSocket latency: < 50ms
- Database queries: < 50ms (p95)
- Page load time: < 2s
- Time to Interactive: < 3s

## 🔍 Monitoring & Observability

### Logging
- Winston logger with structured logging
- Log levels: error, warn, info, debug
- Separate log files by level
- Centralized log aggregation ready

### Metrics
- Request rate and latency
- Error rates
- Database connection pool
- Redis hit/miss ratio
- WebSocket connections

### Health Checks
```
GET /health        - Basic health check
GET /health/ready  - Readiness probe
GET /health/live   - Liveness probe
```

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test
npm run test:coverage

# Run frontend tests
cd client
npm test
npm run test:e2e
```

## 📦 Deployment

### Docker Deployment

```bash
# Production build
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

### Cloud Deployment (AWS/GCP/Azure)

1. Set up managed MongoDB (Atlas, DocumentDB)
2. Set up managed Redis (ElastiCache, MemoryStore)
3. Deploy containers to ECS/GKE/AKS
4. Configure load balancer with SSL
5. Set up CloudWatch/Stackdriver monitoring
6. Configure auto-scaling policies

## 🔒 RBAC & Permissions

### Default Roles

1. **Owner**: Full access to organization
2. **Admin**: Manage organization, members, projects
3. **Manager**: Manage projects and tasks
4. **Member**: View and edit assigned tasks
5. **Guest**: Read-only access

### Permission System

Permissions are granular and composable, mapped to roles. See `server/src/config/constants.ts` for the full list.

## 🎨 UI/UX Features (2026)

- Dark/Light mode
- Responsive design (mobile-first)
- Keyboard shortcuts
- ARIA accessibility
- Loading states
- Error boundaries
- Toast notifications
- Modal dialogs
- Infinite scroll
- Drag & drop
- File upload

---

## 🚀 Deployment Tips

- Push your code to GitHub/GitLab.
- Deploy to Vercel, AWS, Azure, or DigitalOcean for a live demo.
- Set environment variables for production.
- Add screenshots and a project summary to your portfolio/CV.

---

## 📝 License

Proprietary - All rights reserved

## 👥 Support

- Documentation: https://docs.auroraops.com
- Email: support@auroraops.com
- Status: https://status.auroraops.com

---

Built with ❤️ by the Aurora Ops Team
