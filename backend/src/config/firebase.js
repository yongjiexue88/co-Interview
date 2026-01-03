const admin = require('firebase-admin');

// Initialize Firebase Admin
// In production, this uses GOOGLE_APPLICATION_CREDENTIALS env var
// In local dev, you can set the path to your service account JSON
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
