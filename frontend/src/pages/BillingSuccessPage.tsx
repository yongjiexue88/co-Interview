import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const BillingSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setErrorMsg('No session ID found.');
            return;
        }

        const maxAttempts = 30; // 60s total

        const checkStatus = async () => {
            try {
                let currentAttempts = 0;
                setAttempts(prev => {
                    currentAttempts = prev + 1;
                    return currentAttempts;
                });

                const res = await api.get(`/billing/checkout-status?session_id=${sessionId}`);
                const data = res.data;

                if (data.status === 'success' || data.status === 'complete') {
                    setStatus('success');
                    clearInterval(pollInterval);

                    // Force a reload of the current user's profile
                    if (user) {
                        try {
                            await user.reload();
                        } catch (e) {
                            console.error('Failed to reload user:', e);
                        }
                    }

                    // Track Purchase
                    import('../lib/analytics').then(({ trackEvent }) => {
                        trackEvent('purchase', {
                            transaction_id: sessionId,
                            value: 99,
                            currency: 'USD',
                        });
                    });

                    setTimeout(() => navigate('/dashboard'), 2000);
                } else if (currentAttempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    setStatus('processing'); // Stuck in processing
                }
            } catch (err: any) {
                console.error('Error checking status:', err);
                setAttempts(prev => {
                    if (prev > 5) {
                        clearInterval(pollInterval);
                        setStatus('error');
                        setErrorMsg('Failed to verify payment status. Please contact support.');
                    }
                    return prev;
                });
            }
        };

        const pollInterval = setInterval(checkStatus, 2000);
        checkStatus();

        return () => clearInterval(pollInterval);
    }, [sessionId, navigate, user]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
                {status === 'loading' || status === 'processing' ? (
                    <>
                        <Loader2 className="w-12 h-12 text-[#EFCC3A] animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h1>
                        <p className="text-gray-400">Please wait while we confirm your purchase.</p>
                        {status === 'processing' && attempts > 10 && (
                            <p className="text-sm text-yellow-500 mt-4">This is taking longer than usual...</p>
                        )}
                    </>
                ) : status === 'success' ? (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
                        <p className="text-gray-400 mb-6">Your access has been upgraded.</p>
                        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">{errorMsg || 'Please contact support.'}</p>
                        <button onClick={() => navigate('/dashboard')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg">
                            Return to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BillingSuccessPage;
