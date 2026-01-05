export interface UserData {
    id: string;
    email: string;
    // V2 Nested Fields
    profile?: {
        displayName: string | null;
        photoURL: string | null;
        createdAt: string;
        lastLoginAt: string;
        locale?: string;
        timezone?: string;
    };
    preferences?: {
        onboarding?: {
            userPersona?: string;
            userRole?: string;
            userExperience?: string;
            userReferral?: string;
        };
        tailor?: {
            outputLanguage?: string;
            programmingLanguage?: string;
            audioLanguage?: string;
            customPrompt?: string | null;
        };
    };
    access?: {
        planId: 'free' | 'pro' | 'lifetime';
        accessStatus: 'active' | 'grace_period' | 'locked';
        concurrencyLimit: number;
        features?: Record<string, boolean>;
    };
    usage?: {
        quotaSecondsMonth: number;
        quotaSecondsUsed: number;
        quotaResetAt: string;
    };
    billing?: {
        stripeCustomerId?: string;
        subscriptionId?: string;
        billingStatus?: string;
    };
    security?: {
        lastLoginIp?: string;
        lastLoginUserAgent?: string;
    };
    devicesSummary?: {
        deviceCount: number;
        lastPlatform?: string;
        lastSeenAt?: string;
    };
    meta?: {
        schemaVersion: number;
        updatedAt: string;
        sourceOfTruth: string;
    };

    // V1 Backward Compatibility (Optional)
    plan?: 'free' | 'pro' | 'lifetime';
    status?: 'active' | 'banned';
    quotaSecondsMonth?: number;
    quotaSecondsUsed?: number;
    concurrencyLimit?: number;
    createdAt: string;
    source?: string;
}
