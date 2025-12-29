import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, Mail, AlertCircle, ArrowRight } from 'lucide-react';

interface PreRegisterFormProps {
    source: 'hero' | 'final_cta' | 'navbar';
    variant?: 'default' | 'compact';
    trackingProps?: Record<string, any>;
}

type FormState = 'idle' | 'loading' | 'qualifying' | 'success' | 'error';

const PreRegisterForm: React.FC<PreRegisterFormProps> = ({ source, variant = 'default', trackingProps }) => {
    const [email, setEmail] = useState('');
    const [formState, setFormState] = useState<FormState>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setFormState('error');
            setErrorMessage('Please enter a valid email address');
            return;
        }

        setFormState('loading');

        try {
            await setDoc(doc(db, 'preregistrations', email.toLowerCase()), {
                email: email.toLowerCase(),
                source,
                createdAt: serverTimestamp(),
                ...trackingProps // Store tracking props in Firestore too for easy debugging
            });

            // Track signup immediately
            import('../lib/analytics').then(({ trackEvent }) => {
                trackEvent('sign_up', {
                    method: 'email',
                    source: source,
                    ...trackingProps
                });
            });

            // Move to qualification step instead of direct success
            setFormState('qualifying');
        } catch (error) {
            console.error('Error adding pre-registration:', error);
            setFormState('error');
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    const handleQualifierSelect = async (intent: string) => {
        if (!email) return;

        if (intent !== 'skip') {
            try {
                await updateDoc(doc(db, 'preregistrations', email.toLowerCase()), {
                    intent,
                    intentCapturedAt: serverTimestamp()
                });

                import('../lib/analytics').then(({ trackEvent }) => {
                    trackEvent('qualifier_submitted', {
                        intent,
                        source,
                        ...trackingProps
                    });
                });
            } catch (error) {
                console.error('Error saving intent:', error);
            }
        }

        navigate(`/success?email=${encodeURIComponent(email)}`);
        setEmail('');
    };

    if (formState === 'qualifying') {
        const intents = [
            { id: 'faang', label: 'FAANG' },
            { id: 'startup', label: 'Startup' },
            { id: 'internship', label: 'Internship' },
            { id: 'unsure', label: 'Not sure yet' }
        ];

        return (
            <div className="w-full animate-fadeIn">
                <p className="text-white font-medium mb-3">What are you preparing for?</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {intents.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleQualifierSelect(item.label)}
                            className="bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 hover:border-[#FACC15]/50 text-gray-300 hover:text-white py-2 px-3 rounded-lg text-sm transition-all text-left flex items-center justify-between group"
                        >
                            <span>{item.label}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#FACC15]" />
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => handleQualifierSelect('skip')}
                    className="text-xs text-gray-500 hover:text-gray-400 underline decoration-dotted"
                >
                    Skip this step
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={variant === 'compact' ? 'w-full max-w-md' : 'w-full max-w-lg'}>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (formState === 'error') setFormState('idle');
                        }}
                        placeholder="Enter your email"
                        className={`w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 transition-all ${formState === 'error' ? 'border-red-500' : 'border-white/10 hover:border-white/20'
                            }`}
                        disabled={formState === 'loading'}
                    />
                </div>
                <button
                    type="submit"
                    disabled={formState === 'loading'}
                    className="px-8 py-4 bg-gradient-to-r from-[#FACC15] to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-black font-semibold rounded-full transition-all duration-300 shadow-lg shadow-[#FACC15]/20 hover:shadow-[#FACC15]/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
                >
                    {formState === 'loading' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Joining...</span>
                        </>
                    ) : (
                        <span>Get Early Access</span>
                    )}
                </button>
            </div>

            {formState === 'error' && (
                <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <p className="text-center sm:text-left text-xs text-gray-500 mt-4">
                🎁 Pre-register now and get <span className="text-[#FACC15] font-medium">30 days free</span> when we launch
            </p>
        </form>
    );
};

export default PreRegisterForm;
