import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Mail } from 'lucide-react';

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (user && !isSuccess) {
            navigate('/dashboard');
        }
    }, [user, navigate, isSuccess]);

    const handleGoogleSignUp = async () => {
        try {
            setError('');
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Sign up failed:', error);
            setError('Failed to sign up with Google. Please try again.');
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Sign up failed:', error);
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (error.code === 'auth/weak-password') {
                setError('Password is too weak. Please use a stronger password.');
            } else {
                setError('Failed to create account. Please try again.');
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

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white">Check your info</h1>
                    <p className="text-gray-400">
                        We've sent a verification email to <span className="text-white font-medium">{email}</span>.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Please verify your email to secure your account.
                    </p>
                    <div className="space-y-3 pt-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-[#EFCC3A] hover:bg-[#D4B22A] text-black font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
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
                <h1 className="text-2xl font-semibold text-white">Create your account</h1>
            </div>

            {/* Sign Up Card */}
            <div className="w-full max-w-md space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Google Sign Up Button */}
                <button
                    onClick={handleGoogleSignUp}
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
                    Continue with Google
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
                <form onSubmit={handleEmailSignUp} className="space-y-4">
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
                    <div>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full bg-[#2a2a2a] border border-white/10 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 focus:border-transparent transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </button>
                </form>

                {/* Sign In Link */}
                <Link
                    to="/signin"
                    className="block w-full bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 font-medium py-3 px-4 rounded-lg transition-colors text-center"
                >
                    Already have an account? Sign in →
                </Link>
            </div>
        </div>
    );
};

export default SignUpPage;
