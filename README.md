
# Senior Care Incident Logging Tool

A modern, AI-powered incident logging system for senior care facilities. Built with real-world needs in mind - staff can quickly log incidents, get AI summaries, and track everything through a clean, responsive interface.

## What This Is

This is a full-stack application I built to help senior care facilities manage incidents more effectively. Think of it as a digital incident book that's smart enough to summarize what happened and help staff track follow-ups.

The system handles everything from falls and behavioral incidents to medication issues, with AI-powered summaries that help care teams understand what happened quickly.

## Why I Built This

Senior care facilities deal with incidents daily - falls, behavioral changes, medication issues, you name it. The old paper-based systems were clunky and didn't help staff understand patterns or track follow-ups effectively.

So I built this to solve real problems:
- **Quick logging** - Staff can log incidents in seconds
- **AI summaries** - Get instant, clear summaries of what happened
- **Smart tracking** - Follow incidents from open to resolved
- **Easy searching** - Find past incidents quickly
- **Export capabilities** - Generate reports for management

## Tech Stack

I chose technologies that work well together and are production-ready:

**Backend:**
- Node.js + Express (TypeScript) - Reliable, fast, type-safe
- PostgreSQL + Sequelize - Robust database with great ORM
- Firebase Auth - Secure, battle-tested authentication
- OpenAI GPT-3.5 - For generating incident summaries
- Jest - Comprehensive testing

**Frontend:**
- Next.js 14 + React 18 - Modern, fast, SEO-friendly
- TypeScript - Type safety across the stack
- Tailwind CSS - Rapid, consistent styling
- Firebase Auth - Same auth system as backend

## Key Features

### For Staff
- **Multi-method login** - Google, email/password, or passwordless email links
- **Quick incident logging** - Simple form with validation
- **AI summaries** - One-click AI summaries of incidents
- **Smart filtering** - Find incidents by type, status, date
- **Status tracking** - Move incidents through workflow (Open → In Progress → Resolved → Closed)

### For Management
- **Advanced search** - Search across all incident descriptions
- **Export capabilities** - Download data as JSON or CSV
- **Pagination** - Handle large datasets efficiently
- **Sorting** - Sort by any field (date, type, status)
- **Real-time updates** - See changes immediately

## Getting Started

### Prerequisites
You'll need:
- Docker and Docker Compose (for easy setup)
- A Firebase project (free tier works fine)
- An OpenAI API key (GPT-3.5 is quite affordable)

### Quick Start (Recommended)

The easiest way to get everything running:

```bash
# Clone and start everything
git clone <repository>
cd senior-care-incidents
./dev.sh
```

This single command will:
- Start PostgreSQL database
- Start the backend API with hot reloading
- Start the frontend with Next.js dev server
- Set up all the networking between services

Then just visit http://localhost:3000 and you're ready to go!

### Manual Setup

If you prefer to set things up manually:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## Firebase Setup

You'll need to set up Firebase for authentication. Here's the step-by-step:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it something like `senior-care-incidents`
4. Enable Google Analytics if you want (optional)

### 2. Enable Authentication Methods
In your Firebase project:
1. Go to "Authentication" → "Sign-in method"
2. Enable **Google** (for staff convenience)
3. Enable **Email/Password** (for traditional login)
4. Enable **Email link** (for passwordless login)

### 3. Get Your Service Account Key
1. Go to "Project settings" → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as `senior-care-incidents-firebase-adminsdk-fbsvc-2d6dfa3c64.json` in your project root

### 4. Get Web App Config
1. Go to "Project settings" → "General"
2. Scroll to "Your apps" section
3. Click "Add app" → "Web"
4. Register with nickname "CareTracker Web"
5. Copy the config object for your frontend

### 5. Environment Variables

Create these files with your actual values:

**Backend (.env):**
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=senior_care_incidents
DB_USER=postgres
DB_PASSWORD=password

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

OPENAI_API_KEY=sk-your-openai-api-key

PORT=3001
NODE_ENV=development
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Documentation

All endpoints require Firebase JWT authentication. Include the token in your requests:

```
Authorization: Bearer <firebase-jwt-token>
```

### Core Endpoints

#### Create Incident
```http
POST /api/incidents
Content-Type: application/json

{
  "type": "fall",
  "description": "Patient fell in bathroom and sustained minor injuries",
  "status": "open"
}
```

#### Get Incidents (with search & filtering)
```http
GET /api/incidents?page=1&limit=10&search=fall&type=fall&status=open&sortBy=createdAt&sortOrder=DESC
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in descriptions
- `type` - Filter by type (fall, behaviour, medication, other)
- `status` - Filter by status (open, in_progress, resolved, closed)
- `sortBy` - Sort field (createdAt, updatedAt, type, status)
- `sortOrder` - ASC or DESC

#### Update Incident Status
```http
PATCH /api/incidents/:id/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

#### Generate AI Summary
```http
POST /api/incidents/:id/summarize
```

#### Export Incidents
```http
GET /api/incidents/export?format=csv
```

## Testing

I've included comprehensive tests to ensure everything works reliably:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

The test suite covers:
- ✅ Incident creation and validation
- ✅ Authentication middleware
- ✅ OpenAI summarization (mocked)
- ✅ Pagination and filtering
- ✅ Status updates
- ✅ Export functionality
- ✅ Error handling

## Troubleshooting

### Common Issues

**Database Connection Problems**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Reset the database
docker-compose down -v
docker-compose up -d
```

**Firebase Auth Issues**
- Double-check your Firebase project ID matches in both frontend and backend
- Make sure your service account key is properly formatted
- Verify authorized domains are set in Firebase Console

**OpenAI API Errors**
- Check your API key is valid and has credits
- GPT-3.5 has generous rate limits, so this is usually a key issue

**Frontend Build Issues**
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

**Hot Reloading Not Working**
```bash
# Rebuild containers
docker-compose down
docker-compose -f docker-compose.dev.yml up --build
```

### Development Commands

**Hot Reloading Development (Recommended)**
```bash
# Start everything with hot reloading
./dev.sh

# Stop all services
npm run stop

# View logs
npm run logs

# Rebuild containers
npm run build
```

**Docker Commands**
```bash
# Start production environment
docker-compose up -d

# Start development with hot reloading
docker-compose -f docker-compose.dev.yml up

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Access database directly
docker exec -it senior-care-incidents-postgres-1 psql -U postgres -d senior_care_incidents
```

## Deployment

### Production Setup

**1. Environment Variables**
```bash
export NODE_ENV=production
export DB_HOST=your-production-db-host
export DB_PASSWORD=your-secure-password
export FIREBASE_PRIVATE_KEY="your-private-key"
export OPENAI_API_KEY=your-openai-key
```

**2. Database Migration**
```bash
cd backend
npm run build
npm start
```

**3. Frontend Build**
```bash
cd frontend
npm run build
npm start
```

**4. Docker Production**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## What's Included

### ✅ Core Requirements
- [x] Node.js + Express (TypeScript)
- [x] PostgreSQL with Sequelize ORM
- [x] Firebase Authentication
- [x] OpenAI (GPT-3.5) for summarizing incidents
- [x] Jest testing
- [x] Next.js (React 18, TypeScript, Tailwind)
- [x] All required API endpoints
- [x] Authentication middleware
- [x] Incident model with all required fields

### 🚀 Bonus Features I Added
- [x] **Hot reloading** for development
- [x] **Docker containerization** with development setup
- [x] **Advanced UI** with modern design
- [x] **Email link authentication** (passwordless)
- [x] **Enhanced validation** and error handling
- [x] **Pagination** for large datasets
- [x] **Real-time search** across descriptions
- [x] **Advanced filtering** by type and status
- [x] **Status tracking** (Open → In Progress → Resolved → Closed)
- [x] **Export functionality** (JSON/CSV)
- [x] **Sorting** by multiple fields
- [x] **Comprehensive testing** with good coverage
- [x] **Professional error handling**
- [x] **Responsive design** for all devices

## Security & Performance

### Security Features
- **Firebase JWT authentication** for all endpoints
- **CORS protection** with proper configuration
- **Helmet security headers** for XSS protection
- **Input validation** and sanitization
- **SQL injection prevention** (Sequelize ORM)
- **Rate limiting** for API endpoints
- **Secure environment variable handling**

### Performance Considerations
- **Database indexing** on user queries and common filters
- **Efficient pagination** for large datasets
- **OpenAI API rate limiting** and error handling
- **Connection pooling** for database
- **Caching strategies** for frequent requests
- **Optimized queries** with proper joins
- **Frontend optimization** with Next.js

## Contributing

I'd love to see this project grow! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Built with care for senior care facilities** ❤️

*This system was designed to make incident logging less stressful and more effective for care teams. Every feature was built with real-world usage in mind.*
