import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await sendPasswordResetEmail(auth, email);
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Password reset failed:', error);
            if (error.code === 'auth/user-not-found') {
                setError('No account found with this email address.');
            } else if (error.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white">Check your email</h1>
                    <p className="text-gray-400">
                        We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                    </p>
                    <p className="text-gray-500 text-sm">
                        Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <div className="space-y-3 pt-4">
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="w-full bg-[#2a2a2a] hover:bg-[#333333] text-white font-medium py-3 px-4 rounded-lg transition-colors border border-white/5"
                        >
                            Try a different email
                        </button>
                        <Link
                            to="/signin"
                            className="block w-full bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 font-medium py-3 px-4 rounded-lg transition-colors text-center"
                        >
                            Back to sign in
                        </Link>
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
                <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
                <p className="text-gray-400 mt-2 text-center">
                    Enter your email and we'll send you a reset link
                </p>
            </div>

            {/* Reset Form */}
            <div className="w-full max-w-md space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
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
                                Sending...
                            </>
                        ) : (
                            'Send reset link'
                        )}
                    </button>
                </form>

                {/* Back to Sign In */}
                <Link
                    to="/signin"
                    className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-white/5 text-gray-400 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                </Link>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
