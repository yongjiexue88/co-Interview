import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const SignInPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        try {
            setError('');
            // If in Electron mode, do NOT use popup. Logic should be handled by Electron opening /api/v1/auth/google directly.
            // But if user manually came here in browser and wants to open Electron?
            // For now, assume this button is for Web Context.

            // If we are in Electron Webview (unlikely now), popups might fail.
            // But we are in System Browser now.
            const result = await signInWithPopup(auth, googleProvider);
            await handleElectronRedirect(result.user);
        } catch (error) {
            console.error('Login failed:', error);
            setError('Failed to log in with Google. Please try again.');
        }
    };

    const handleElectronRedirect = async (firebaseUser: any) => {
        const searchParams = new URLSearchParams(window.location.search);
        const isElectron = searchParams.get('electron') === 'true';

        if (isElectron) {
            try {
                // Exchange ID token for Custom Token
                const idToken = await firebaseUser.getIdToken();
                // Use local backend in dev, prod in build. 
                // We can guess based on window.location.hostname
                const apiBase = window.location.hostname === 'localhost'
                    ? 'http://localhost:8080/api'
                    : 'https://co-interview.com/api';

                const response = await fetch(`${apiBase}/v1/auth/exchange`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const { custom_token } = await response.json();

                    // Redirect to protocol
                    const redirectUrl = new URL('co-interview://auth-callback');
                    redirectUrl.searchParams.set('token', customToken);
                    redirectUrl.searchParams.set('uid', firebaseUser.uid);
                    redirectUrl.searchParams.set('email', firebaseUser.email || '');
                    redirectUrl.searchParams.set('name', firebaseUser.displayName || '');
                    if (firebaseUser.photoURL) redirectUrl.searchParams.set('photo', firebaseUser.photoURL);

                    window.location.href = redirectUrl.toString();
                    return;
                }
            } catch (err) {
                console.error('Token exchange failed:', err);
                // Fallback: Just go to dashboard if failed? Or show error?
            }
        }

        // Default web behavior
        navigate('/dashboard');
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await handleElectronRedirect(result.user);
        } catch (error: any) {
            console.error('Login failed:', error);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setError('Invalid email or password.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Failed to log in. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center">
                <img
                    src="https://www.interviewcoder.co/logo.svg"
                    alt="Co-Interview"
                    className="w-12 h-12 mb-4"
                />
                <h1 className="text-2xl font-semibold text-white">Log in to Co-Interview</h1>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Google Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#2a2a2a] hover:bg-[#333333] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors border border-white/5"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-4 text-gray-500">Or continue with email</span>
                    </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full bg-[#2a2a2a] border border-white/10 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-transparent transition-colors"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-[#2a2a2a] border border-white/10 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-transparent transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#3a3a3a] hover:bg-[#444444] disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                {/* Sign Up Link */}
                <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                    Don't have an account? Sign up →
                </button>

                {/* Forgot Password */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
                    >
                        Forgot Password?
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
