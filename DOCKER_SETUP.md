# Docker Setup Guide

## Prerequisites
- Docker Desktop installed and running
- `.env` file in `backend/` directory with:
  - `GROQ_API_KEY`
  - `PINECONE_API_KEY`
  - `PORT=5001`

## Running with Docker

### 1. Build and Start All Services
```bash
docker-compose up --build
```

### 2. Run in Background (Detached Mode)
```bash
docker-compose up -d --build
```

### 3. View Logs
```bash
docker-compose logs -f
```

### 4. Stop Services
```bash
docker-compose down
```

### 5. Rebuild After Code Changes
```bash
docker-compose up --build
```

## Access the Application
- **Frontend:** http://localhost
- **Backend API:** http://localhost:5001/api
- **Health Check:** http://localhost:5001/

## Using with Ngrok
After starting Docker containers:
```bash
npx ngrok http 80
```

## Troubleshooting

### Port Already in Use
If port 5001 or 80 is already in use:
```bash
# Stop current npm processes first
# Then run docker-compose
docker-compose down
docker-compose up --build
```

### Environment Variables Not Loading
Make sure `backend/.env` exists with all required keys:
```
GROQ_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
PORT=5001
```

### Rebuild from Scratch
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```
