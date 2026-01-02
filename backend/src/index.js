require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const errorHandler = require('./middleware/errorHandler');

// Routes
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const usageRoutes = require('./routes/usage');
const billingRoutes = require('./routes/billing');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// CORS - allow same-origin (Firebase Hosting) and local dev
app.use(cors({
    origin: [
        'https://co-interview.com',
        'https://www.co-interview.com',
        process.env.FRONTEND_URL || 'http://localhost:5173'
    ],
    credentials: true
}));

// Parse JSON (except for webhooks which need raw body)
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes - all under /api prefix for Firebase Hosting rewrite
app.use('/api/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/realtime', sessionRoutes);
app.use('/api/v1/usage', usageRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/webhooks', webhookRoutes);

// Also support root paths for local testing
app.use('/health', healthRoutes);
app.use('/v1/auth', authRoutes);
app.use('/v1/realtime', sessionRoutes);
app.use('/v1/usage', usageRoutes);
app.use('/v1/billing', billingRoutes);
app.use('/webhooks', webhookRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Co-Interview Backend running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API routes: /api/v1/* and /api/health`);
});

module.exports = app;

