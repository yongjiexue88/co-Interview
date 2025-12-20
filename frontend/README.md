# Co-Interview Frontend

Modern web frontend for Co-Interview built with Vite + React.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to GCP

### Option 1: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (one-time)
firebase init hosting

# Deploy
npm run deploy
```

### Option 2: Cloud Run

```bash
# Build the app
npm run build

# Deploy to Cloud Run (using gcloud CLI)
gcloud run deploy co-interview-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 3: Cloud Storage + Load Balancer

```bash
# Build the app
npm run build

# Upload to Cloud Storage
gsutil -m rsync -r dist/ gs://your-bucket-name/

# Configure bucket for website hosting
gsutil web set -m index.html -e index.html gs://your-bucket-name
```

## Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── App.jsx      # Main app component
│   ├── App.css      # App styles
│   ├── main.jsx     # Entry point
│   └── index.css    # Global styles
├── index.html       # HTML template
├── vite.config.js   # Vite configuration
└── package.json     # Dependencies
```

## Tech Stack

- **Vite** - Fast build tool
- **React 18** - UI library
- **Modern CSS** - Custom properties and grid/flexbox

## Next Steps

1. Connect to backend API
2. Add download links for Electron app
3. Implement analytics
4. Add documentation pages
5. Set up CI/CD pipeline
