import { LucideIcon } from 'lucide-react';

export interface Feature {
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface PricingPlan {
    name: string;
    price: string;
    period?: string;
    features: string[];
    recommended?: boolean;
    buttonText: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export enum DemoState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}
