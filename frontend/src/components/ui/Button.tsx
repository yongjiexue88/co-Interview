import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'white' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
    const baseStyles =
        'inline-flex items-center justify-center font-bold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
        // Brand Yellow with gradient effect
        primary:
            'bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black hover:brightness-110 shadow-[0_0_20px_rgba(239,204,58,0.3)] border border-white/10 relative overflow-hidden',
        // Dark background, white text
        secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/5',
        // Solid White
        white: 'bg-white text-black hover:bg-gray-200 shadow-lg',
        // Outline yellow
        outline: 'bg-transparent text-[#EFCC3A] border border-[#EFCC3A]/50 hover:bg-[#EFCC3A]/10 hover:border-[#EFCC3A]',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-4 py-1.5 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
