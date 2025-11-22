# DRB Backend Internship Tasks

A NestJS-based API using NestJS, TypeScript, and MongoDB with JWT-based authentication.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd drb-backend-intens-tasks
```

### 2. Environment Configuration

Create a `.env` file in the root directory based on the `.env.example` template provided in the repository.

### 3. Installation & Running

#### Option A: Using Docker (Recommended)

**Development Mode:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

**Production Mode:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

**Stop Services:**

```bash
docker-compose down

# Remove volumes as well
docker-compose down -v
```

#### Option B: Local Setup

**Install Dependencies:**

```bash
npm install
```

**Run the Application:**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Accessing the Application

Assuming PORT=3000

- **API:** http://localhost:3000
- **Swagger Documentation:** http://localhost:3000/docs
- **Mongo Express (DB UI):** http://localhost:8081
