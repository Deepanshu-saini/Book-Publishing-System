# API Usage Examples

## Prerequisites

1. Start the server: `npm run dev`
2. Run seed script: `npm run seed`

## Live Render Seeding
```bash
curl -X GET "https://book-publishing-system-t9vn.onrender.com/api/seed"
```

## Authentication

### Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "credentials": "admin123"
  }'
```

### Login as Reviewer
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "reviewer",
    "credentials": "reviewer123"
  }'
```

**Note**: Save the `token` from the response to use in subsequent requests.

## Book Operations

### List Books
```bash
curl -X GET "http://localhost:3000/api/books?limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

### Create a Book
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0" \
  -d '{
    "title": "Clean Architecture",
    "authors": "Robert C. Martin",
    "publishedBy": "Prentice Hall"
  }'
```

### Get Book by ID
```bash
curl -X GET http://localhost:3000/api/books/69885b13c3c030d3309b4d05 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

### Update a Book
```bash
curl -X PATCH http://localhost:3000/api/books/69885b13c3c030d3309b4d05 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0" \
  -d '{
    "title": "Clean Architecture: Updated Edition",
    "authors": "Robert C. Martin, Updated"
  }'
```

### Delete a Book
```bash
curl -X DELETE http://localhost:3000/api/books/69885b13c3c030d3309b4d05 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

## Audit Trail (Admin Only)

### List All Audit Logs
```bash
curl -X GET "http://localhost:3000/api/audits?limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

### Filter by Entity Type
```bash
curl -X GET "http://localhost:3000/api/audits?entity=Book&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

### Filter by Date Range
```bash
curl -X GET "http://localhost:3000/api/audits?from=2024-01-01T00:00:00Z&to=2024-12-31T23:59:59Z" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

### Filter by Actor and Action
```bash
curl -X GET "http://localhost:3000/api/audits?actorId=698854f943884c7e1a8ac377&action=update" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

### Filter by Fields Changed
```bash
curl -X GET "http://localhost:3000/api/audits?fieldsChanged=title,authors" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

### Get Specific Audit Log
```bash
curl -X GET http://localhost:3000/api/audits/69885b4ac3c030d3309b4d13 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTg4NTRmOTQzODg0YzdlMWE4YWMzNzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzA1NDM3NjMsImV4cCI6MTc3MDYzMDE2M30.QGl2KczCm0sUUf7-KbGlywajow-Es3IXC4ZPKkZy0p0"
```

## Health Check
```bash
curl http://localhost:3000/health
```