import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Check, Loader2, Mail, AlertCircle } from 'lucide-react';

interface PreRegisterFormProps {
    source: 'hero' | 'final_cta' | 'navbar';
    variant?: 'default' | 'compact';
}

type FormState = 'idle' | 'loading' | 'success' | 'error' | 'duplicate';

const PreRegisterForm: React.FC<PreRegisterFormProps> = ({ source, variant = 'default' }) => {
    const [email, setEmail] = useState('');
    const [formState, setFormState] = useState<FormState>('idle');
    const [errorMessage, setErrorMessage] = useState('');

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
            // Use email as document ID to prevent duplicates and allow write-only access
            // We use setDoc which will overwrite if exists, effectively acting as "upsert"
            // This is secure because we don't need to read the DB to check existence
            await setDoc(doc(db, 'preregistrations', email.toLowerCase()), {
                email: email.toLowerCase(),
                source,
                createdAt: serverTimestamp(),
            });

            setFormState('success');
            setEmail('');
        } catch (error) {
            console.error('Error adding pre-registration:', error);
            setFormState('error');
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    if (formState === 'success') {
        return (
            <div className={`flex items-center gap-3 ${variant === 'compact' ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                    <p className="text-white font-medium">You're on the list!</p>
                    <p className="text-sm text-gray-400">We'll notify you when we launch.</p>
                </div>
            </div>
        );
    }

    if (formState === 'duplicate') {
        return (
            <div className={`flex items-center gap-3 ${variant === 'compact' ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-[#FACC15]/20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#FACC15]" />
                </div>
                <div>
                    <p className="text-white font-medium">Already registered!</p>
                    <p className="text-sm text-gray-400">This email is already on our waitlist.</p>
                </div>
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
