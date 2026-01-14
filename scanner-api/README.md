# Scanner API Microservice

This is a standalone microservice for website scanning using Playwright.

## Local Development

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run in development mode
npm run dev
```

## Deploy to Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set the root directory to `scanner-api`
4. Railway will auto-detect the Dockerfile and deploy

## API Endpoints

### Health Check
```
GET /health
```

### Scan Website
```
POST /scan
Content-Type: application/json

{
  "url": "https://example.com"
}
```

Response:
```json
{
  "success": true,
  "report": {
    "url": "https://example.com",
    "overallScore": 85,
    "checks": { ... }
  }
}
```
