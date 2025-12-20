import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Loader2 } from 'lucide-react';

/**
 * ElectronAuthPage - Handles authentication for the Electron desktop app.
 * After successful auth, redirects to co-interview://auth-callback with user data.
 */
const ElectronAuthPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const isSignUp = searchParams.get('mode') === 'signup';

    const hasRun = React.useRef(false);

    const handleGoogleAuth = React.useCallback(async () => {
        setStatus('loading');
        setError('');

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Get the Firebase ID token for backend verification
            const idToken = await user.getIdToken();

            // Redirect back to Electron app with user data + token
            const callbackUrl = new URL('co-interview://auth-callback');
            callbackUrl.searchParams.set('token', idToken);
            callbackUrl.searchParams.set('uid', user.uid);
            callbackUrl.searchParams.set('email', user.email || '');
            callbackUrl.searchParams.set('name', user.displayName || '');
            if (user.photoURL) {
                callbackUrl.searchParams.set('photo', user.photoURL);
            }

            setStatus('success');

            // Small delay so user sees success message
            setTimeout(() => {
                window.location.href = callbackUrl.toString();
            }, 500);
        } catch (err: any) {
            console.error('Auth error:', err);
            // Ignore popup closed errors if success already happened (race condition)
            if (status === 'success') return;

            setStatus('error');
            if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                setError('Sign-in was cancelled. Click below to try again.');
            } else if (err.code === 'auth/popup-blocked') {
                setError('Popup was blocked. Please allow popups and try again.');
            } else {
                setError(err.message || 'Authentication failed. Please try again.');
            }
        }
    }, [status]);

    useEffect(() => {
        // Auto-start Google sign-in on page load
        if (!hasRun.current) {
            hasRun.current = true;
            handleGoogleAuth();
        }
    }, [handleGoogleAuth]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center">
                <img src="/favicon.png" alt="Co-Interview" className="w-16 h-16 mb-4 rounded-xl" />
                <h1 className="text-2xl font-semibold text-white">{isSignUp ? 'Create Account' : 'Sign in to Co-Interview'}</h1>
                <p className="text-gray-400 mt-2 text-center">Authenticating for desktop app...</p>
            </div>

            {/* Status Card */}
            <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-xl p-8">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-[#FACC15] animate-spin" />
                        <p className="text-gray-300">Signing you in...</p>
                        <p className="text-gray-500 text-sm">A popup should appear</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-green-400 font-medium">Success!</p>
                        <p className="text-gray-400 text-sm">Returning to Co-Interview app...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-400 text-sm text-center">{error}</p>
                        <button
                            onClick={handleGoogleAuth}
                            className="mt-4 bg-[#4285F4] hover:bg-[#357abd] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#fff"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#fff"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#fff"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#fff"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Try Again with Google
                        </button>
                    </div>
                )}

                {status === 'idle' && (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-gray-400">Preparing authentication...</p>
                    </div>
                )}
            </div>

            {/* Back to app link */}
            <button
                onClick={() => (window.location.href = 'co-interview://auth-callback?cancel=true')}
                className="mt-8 text-gray-500 hover:text-gray-400 text-sm transition-colors"
            >
                Cancel and return to app
            </button>
        </div>
    );
};

export default ElectronAuthPage;
