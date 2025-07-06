# Issues & Insights Tracker - Backend

A comprehensive FastAPI backend for the Issues & Insights Tracker application with role-based access control, real-time updates, and background job processing.

## Features

- **FastAPI** with automatic OpenAPI documentation
- **PostgreSQL** database with SQLAlchemy ORM
- **JWT Authentication** with role-based access control
- **Real-time updates** via WebSockets
- **File upload/download** with validation
- **Background jobs** with Celery and Redis
- **Docker containerization** with docker-compose
- **Database migrations** with Alembic
- **Comprehensive API documentation**

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- PostgreSQL 15+ (for local development)
- Redis (for local development)

### Option 1: Docker Setup (Recommended)

1. **Clone and navigate to backend directory:**
```bash
cd backend
```

2. **Copy environment file:**
```bash
cp .env.example .env
```

3. **Start all services:**
```bash
docker-compose up -d
```

4. **Initialize database with sample data:**
```bash
docker-compose exec backend python scripts/init_db.py
```

5. **Access the services:**
- API Documentation: http://localhost:8000/api/docs
- Backend API: http://localhost:8000
- pgAdmin: http://localhost:5050 (admin@example.com / admin)
- Redis: localhost:6379

### Option 2: Local Development Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Start PostgreSQL and Redis:**
```bash
# Using Docker for just the databases
docker-compose -f docker-compose.dev.yml up -d
```

3. **Set environment variables:**
```bash
export DATABASE_URL="postgresql://postgres:password@localhost:5432/issues_tracker"
export REDIS_URL="redis://localhost:6379"
export SECRET_KEY="your-secret-key"
```

4. **Run database migrations:**
```bash
alembic upgrade head
```

5. **Initialize sample data:**
```bash
python scripts/init_db.py
```

6. **Start the FastAPI server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

7. **Start Celery worker (in another terminal):**
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

8. **Start Celery beat (in another terminal):**
```bash
celery -A app.workers.celery_app beat --loglevel=info
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/refresh` - Refresh access token

### Users
- `GET /api/v1/users/me` - Get current user info
- `GET /api/v1/users/` - List all users (Admin only)
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PUT /api/v1/users/{user_id}` - Update user

### Issues
- `GET /api/v1/issues/` - List issues (filtered by role)
- `POST /api/v1/issues/` - Create new issue
- `GET /api/v1/issues/{issue_id}` - Get issue details
- `PUT /api/v1/issues/{issue_id}` - Update issue
- `DELETE /api/v1/issues/{issue_id}` - Delete issue

### Files
- `POST /api/v1/files/upload/{issue_id}` - Upload file to issue
- `GET /api/v1/files/{file_id}` - Download file
- `DELETE /api/v1/files/{file_id}` - Delete file

### Statistics
- `GET /api/v1/stats/dashboard` - Get dashboard statistics

### WebSocket
- `WS /ws/{client_id}` - WebSocket connection for real-time updates

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `hashed_password` (String)
- `name` (String)
- `role` (Enum: ADMIN, MAINTAINER, REPORTER)
- `avatar_url` (String, Optional)
- `google_id` (String, Optional)
- `is_active` (Boolean)
- `created_at`, `updated_at` (Timestamp)

### Issues Table
- `id` (UUID, Primary Key)
- `title` (String)
- `description` (Text)
- `severity` (Enum: LOW, MEDIUM, HIGH, CRITICAL)
- `status` (Enum: OPEN, TRIAGED, IN_PROGRESS, DONE)
- `reporter_id` (UUID, Foreign Key)
- `assignee_id` (UUID, Foreign Key, Optional)
- `tags` (Array of Strings)
- `created_at`, `updated_at` (Timestamp)

### Files Table
- `id` (UUID, Primary Key)
- `filename` (String)
- `original_name` (String)
- `file_path` (String)
- `file_size` (BigInteger)
- `content_type` (String)
- `issue_id` (UUID, Foreign Key)
- `uploaded_by` (UUID, Foreign Key)
- `created_at` (Timestamp)

### Daily Stats Table
- `id` (UUID, Primary Key)
- `date` (Date, Unique)
- `total_issues`, `open_issues`, etc. (Integer)
- `critical_count`, `high_count`, etc. (Integer)
- `created_at` (Timestamp)

## Role-Based Access Control

### ADMIN
- Full access to all features
- Can manage users
- Can delete any issue
- Can view all issues

### MAINTAINER
- Can triage and assign issues
- Can edit any issue
- Can view all issues
- Cannot delete issues or manage users

### REPORTER
- Can create issues
- Can only view/edit their own issues
- Cannot assign issues or manage users

## Background Jobs

### Daily Statistics Aggregation
- Runs every 30 minutes
- Aggregates issue counts by status and severity
- Stores results in `daily_stats` table

## pgAdmin Setup

1. **Access pgAdmin:** http://localhost:5050
2. **Login:** admin@example.com / admin
3. **Add Server:**
   - Name: Issues Tracker
   - Host: db (or localhost if running locally)
   - Port: 5432
   - Database: issues_tracker
   - Username: postgres
   - Password: password

## Sample Credentials

After running the initialization script, you can use these credentials:

- **Admin:** admin@example.com / password
- **Maintainer:** maintainer@example.com / password
- **Reporter:** reporter@example.com / password

## Environment Variables

Key environment variables (see `.env.example`):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/issues_tracker
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## Development Commands

```bash
# Run tests (when implemented)
pytest

# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .

# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Downgrade migration
alembic downgrade -1
```

## Production Deployment

1. **Update environment variables** in `.env`
2. **Use production database** (not the default credentials)
3. **Set strong SECRET_KEY**
4. **Configure HTTPS** with proper SSL certificates
5. **Set up monitoring** and logging
6. **Configure backup** for PostgreSQL

## Monitoring and Logging

The application includes structured logging and can be extended with:
- Prometheus metrics
- OpenTelemetry tracing
- Health check endpoints
- Performance monitoring

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- SQL injection prevention (SQLAlchemy ORM)
- CORS configuration

## API Documentation

Visit http://localhost:8000/api/docs for interactive API documentation with Swagger UI.

## Troubleshooting

### Common Issues

1. **Database connection error:**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in environment

2. **Redis connection error:**
   - Ensure Redis is running
   - Check REDIS_URL in environment

3. **File upload issues:**
   - Check UPLOAD_DIR permissions
   - Verify MAX_FILE_SIZE setting

4. **Migration errors:**
   - Run `alembic upgrade head`
   - Check database connectivity

### Logs

View logs for different services:
```bash
# Backend logs
docker-compose logs backend

# Worker logs
docker-compose logs worker

# Database logs
docker-compose logs db
```