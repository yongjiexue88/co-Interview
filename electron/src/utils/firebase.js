// Firebase initialization for Electron
// Uses same config as frontend for consistent auth

const { initializeApp } = require('firebase/app');
const { getAuth, GoogleAuthProvider, signInWithCredential, signInWithCustomToken, onAuthStateChanged } = require('firebase/auth');

// Firebase config - same as frontend
const firebaseConfig = {
    apiKey: 'AIzaSyCMCZqDX-HGvXCDRBlE0uXEeddlNC_oXwo',
    authDomain: 'co-interview-481814.firebaseapp.com',
    projectId: 'co-interview-481814',
    storageBucket: 'co-interview-481814.firebasestorage.app',
    messagingSenderId: '391576745300',
    appId: '1:391576745300:web:4078bf13caea97a3c504c1',
    measurementId: 'G-3ENXT54XQN',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Get current ID token (refreshes if needed)
async function getIdToken() {
    const user = auth.currentUser;
    if (!user) {
        return null;
    }
    try {
        // Force refresh to ensure token is valid
        return await user.getIdToken(true);
    } catch (error) {
        console.error('Error getting ID token:', error);
        return null;
    }
}

// Get current user info
function getCurrentUser() {
    const user = auth.currentUser;
    if (!user) {
        return null;
    }
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
    };
}

// Sign out
async function signOut() {
    try {
        await auth.signOut();
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
}

// Listen for auth state changes
function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

module.exports = {
    app,
    auth,
    googleProvider,
    getIdToken,
    getCurrentUser,
    signOut,
    onAuthChange,
    signInWithCredential,
    signInWithCustomToken,
    firebaseConfig,
};
