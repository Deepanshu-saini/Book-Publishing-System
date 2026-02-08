# Book Publishing API

A minimal Book Publishing System with comprehensive audit trail, access control, and observability features. Built with Node.js, TypeScript, Express, and MongoDB.

## Key Features

- **Config-driven Audit Trail**: Easily extendable to new entities via configuration
- **Role-based Access Control**: Admin and Reviewer roles with appropriate permissions
- **Comprehensive Logging**: Pino-based structured logging with configurable transports
- **Request Tracing**: AsyncLocalStorage for request context propagation
- **Input Validation**: Zod-based schema validation
- **Cursor-based Pagination**: Efficient pagination for large datasets

## Architecture Decisions

### Database Choice: MongoDB with Mongoose (Atlas)

- **Flexible Schema**: Easy to extend audit logs with new fields without migrations
- **Rich Querying**: Excellent support for complex audit trail filters
- **Atlas Integration**: Managed service with built-in monitoring and scaling
- **JSON-native**: Natural fit for audit diffs and metadata storage
- **Indexing**: Efficient compound indexes for audit trail queries

### Hard Delete with Audit Trail

**Justification**: Implemented hard delete (vs soft delete) because:
- Complete audit trail captures all delete operations
- Simpler data model without delete flags
- Better performance for active data queries
- Audit logs provide complete historical record
- Can implement "restore" functionality via audit trail if needed

### Cursor-based Pagination

**Justification**: Chosen over offset-based pagination because:
- Consistent results during concurrent modifications
- Better performance for large datasets
- No "page drift" issues when data changes
- Scales well with MongoDB's natural ordering

## Setup Instructions

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone and install dependencies**:

git clone https://github.com/Deepanshu-saini/Book-Publishing-System.git
cd book-publishing-api
npm install

2. **Environment Configuration**:
copy .env.example to .env and update variables value

3. **Build the application**:
```bash
npm run build
```

4. **Seed initial data** 
(Local Development):
```bash
npm run seed
```
(Deployed Render Seeding)
**API seeds only the user info**
```bash
curl -X GET "https://book-publishing-system-t9vn.onrender.com/api/seed"
```

5. **Start the server**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## Logging Configuration

The application supports multiple logging transports:

### File Logging (Default)
```bash
LOG_TRANSPORT=file
LOG_FILE_PATH=./logs/app.log
```

### Elasticsearch Integration
```bash
LOG_TRANSPORT=elastic
ELASTIC_URL=https://elastic-instance.com
```

### Logtail Integration
```bash
LOG_TRANSPORT=logtail
LOGTAIL_TOKEN=logtail-token
```

## Audit Configuration

Adding new entities to audit tracking requires only configuration changes:

```typescript
// src/config/index.ts
export const auditConfig = {
  Book: {
    track: true,
    exclude: ['updatedAt'],
    redact: [],
  },
  User: {
    track: true,
    exclude: ['credentials', 'updatedAt'],
    redact: ['credentials'],
  },
  // Add new entities here
  NewEntity: {
    track: true,
    exclude: ['sensitiveField'],
    redact: ['secretField'],
  },
} as const;
```

## API Documentation

### Authentication

All API endpoints (except `/api/auth/login`) require JWT authentication:

```bash
Authorization: Bearer <jwt-token>
```

### Endpoints

#### Authentication
- `POST /api/auth/login` - User login

#### Books (Admin & Reviewer access)
- `GET /api/books` - List books (paginated)
- `POST /api/books` - Create book
- `GET /api/books/:id` - Get book by ID
- `PATCH /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

#### Audit Trail (Admin only)
- `GET /api/audits` - List audit logs with filters
- `GET /api/audits/:id` - Get audit log by ID

## Health Check

```bash
curl http://localhost:3000/health
```

### Deployed to Render
https://book-publishing-system-t9vn.onrender.com
(pre hit the URL to start the server before using)