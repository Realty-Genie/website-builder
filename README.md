# WebForge - Real Estate Website Builder

A production-grade platform for real estate agents to build and deploy professional websites to GitHub Pages.

## Features

- **User Authentication**: Secure JWT + HTTP-only cookies authentication
- **Real Estate Templates**: Professional real estate agent websites
- **GitHub Deployment**: Automated deployment to GitHub Pages
- **AI Chatbot**: Built-in AI chatbot for lead capture
- **Production Ready**: Security headers, rate limiting, input validation

## Tech Stack

### Backend
- Node.js + Express
- MongoDB
- JWT Authentication (HTTP-only cookies)
- Helmet + Rate Limiting
- TypeScript

### Frontend
- Next.js 14
- TypeScript
- Zustand (State Management)
- TailwindCSS

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- GitHub Account + Personal Access Token

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd Website_Builder
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/webforge
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_ORG=Website-Builder-Realty-Genie
BASE_URL=https://your-domain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token (classic) with these permissions:
   - repo (full control)
   - read:org
3. Create an organization for the deployment (e.g., "Website-Builder-Realty-Genie")

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh tokens

### Templates
- `GET /api/templates` - List available templates
- `GET /api/templates/:id` - Get template details

### Sites
- `GET /api/sites` - List user sites
- `POST /api/sites` - Create new site
- `GET /api/sites/:id` - Get site details
- `GET /api/sites/:id/build-logs` - Get build logs
- `POST /api/sites/:id/redeploy` - Redeploy site

## Production Deployment

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Security Notes
- Always change JWT_SECRET in production
- Use HTTPS in production
- Set NODE_ENV=production
- Configure proper CORS origins

## License

MIT
