import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
    useNavigate();
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
            // Track password reset request
            import('../lib/analytics').then(({ trackEvent }) => {
                trackEvent('password_reset_request', {
                    email_domain: email.split('@')[1] || 'unknown',
                });
            });
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
                    {/* Yellow Logo */}
                    <div className="w-16 h-16 bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] rounded-full flex items-center justify-center mx-auto">
                        <img src="/favicon.png" alt="Co-Interview" className="w-10 h-10" />
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white">Check your email</h1>
                    <p className="text-gray-400">
                        We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                    </p>

                    {/* Email Sent Box */}
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 text-left">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-white font-semibold">Email Sent!</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Password reset instructions have been sent to your email. Please check your inbox and click the link to reset your
                            password.
                        </p>
                    </div>

                    {/* What's next? Box */}
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 text-left">
                        <h3 className="text-white font-semibold mb-4">What's next?</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                                Check your email inbox (and spam folder)
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                                Click the reset link in the email
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></span>
                                Create your new password
                            </li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3 pt-2">
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                setEmail('');
                            }}
                            className="w-full bg-[#2a2a2a] hover:bg-[#333333] text-white font-medium py-3.5 px-4 rounded-lg transition-colors border border-white/10"
                        >
                            Send Another Email
                        </button>
                        <Link to="/signin" className="block text-gray-400 hover:text-white transition-colors text-sm">
                            Back to Sign In
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
                <img src="/favicon.png" alt="Co-Interview" className="w-12 h-12 mb-4" />
                <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
                <p className="text-gray-400 mt-2 text-center">Enter your email and we'll send you a reset link</p>
            </div>

            {/* Reset Form */}
            <div className="w-full max-w-md space-y-6">
                {/* Error Message */}
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
