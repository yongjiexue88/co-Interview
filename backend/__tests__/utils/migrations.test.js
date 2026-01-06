const { migrateUserToV2 } = require('../../src/utils/migrations');

describe('User Migrations', () => {
    describe('migrateUserToV2', () => {
        it('should migrate a full V1 user to V2 schema', () => {
            const v1User = {
                email: 'test@example.com',
                displayName: 'Test User',
                photoURL: 'https://example.com/photo.jpg',
                createdAt: new Date('2024-01-01'),
                lastLoginAt: new Date('2024-06-01'),
                locale: 'en-US',
                timezone: 'America/New_York',
                userPersona: 'developer',
                userRole: 'Senior Engineer',
                userExperience: '5-10 years',
                userReferral: 'friend',
                outputLanguage: 'Spanish',
                programmingLanguage: 'JavaScript',
                audioLanguage: 'es',
                customPrompt: 'Custom instructions',
                plan: 'pro',
                status: 'active',
                features: ['audio', 'undetectable'],
                concurrencyLimit: 2,
                quotaSecondsMonth: 36000,
                quotaSecondsUsed: 1000,
                quotaResetAt: new Date('2024-07-01'),
                stripeCustomerId: 'cus_123',
                subscriptionId: 'sub_456',
                billingStatus: 'active',
                lastLoginIp: '192.168.1.1',
                lastLoginUserAgent: 'Mozilla/5.0',
            };

            const v2 = migrateUserToV2(v1User);

            // Check meta
            expect(v2.meta.schemaVersion).toBe(2);
            expect(v2.meta.sourceOfTruth).toBe('migration_v2');
            expect(v2.meta.updatedAt).toBeInstanceOf(Date);

            // Check profile
            expect(v2.profile.email).toBe('test@example.com');
            expect(v2.profile.displayName).toBe('Test User');
            expect(v2.profile.photoURL).toBe('https://example.com/photo.jpg');
            expect(v2.profile.locale).toBe('en-US');
            expect(v2.profile.timezone).toBe('America/New_York');

            // Check preferences.onboarding
            expect(v2.preferences.onboarding.userPersona).toBe('developer');
            expect(v2.preferences.onboarding.userRole).toBe('Senior Engineer');
            expect(v2.preferences.onboarding.userExperience).toBe('5-10 years');
            expect(v2.preferences.onboarding.userReferral).toBe('friend');

            // Check preferences.tailor
            expect(v2.preferences.tailor.outputLanguage).toBe('Spanish');
            expect(v2.preferences.tailor.programmingLanguage).toBe('JavaScript');
            expect(v2.preferences.tailor.audioLanguage).toBe('es');
            expect(v2.preferences.tailor.customPrompt).toBe('Custom instructions');

            // Check access
            expect(v2.access.planId).toBe('pro');
            expect(v2.access.accessStatus).toBe('active');
            expect(v2.access.features).toEqual({ audio: true, undetectable: true });
            expect(v2.access.concurrencyLimit).toBe(2);

            // Check usage
            expect(v2.usage.quotaSecondsMonth).toBe(36000);
            expect(v2.usage.quotaSecondsUsed).toBe(1000);
            expect(v2.usage.quotaResetAt).toEqual(new Date('2024-07-01'));

            // Check billing
            expect(v2.billing.stripeCustomerId).toBe('cus_123');
            expect(v2.billing.subscriptionId).toBe('sub_456');
            expect(v2.billing.billingStatus).toBe('active');

            // Check security
            expect(v2.security.lastLoginIp).toBe('192.168.1.1');
            expect(v2.security.lastLoginUserAgent).toBe('Mozilla/5.0');
        });

        it('should handle minimal V1 user with defaults', () => {
            const minimalUser = {
                email: 'minimal@example.com',
                createdAt: new Date('2024-01-01'),
            };

            const v2 = migrateUserToV2(minimalUser);

            // Check defaults
            expect(v2.profile.email).toBe('minimal@example.com');
            expect(v2.profile.displayName).toBe(null);
            expect(v2.profile.photoURL).toBe(null);
            expect(v2.profile.locale).toBe('en');
            expect(v2.profile.timezone).toBe(null);
            expect(v2.profile.lastLoginAt).toBeInstanceOf(Date);

            expect(v2.preferences.onboarding.userPersona).toBe(null);
            expect(v2.preferences.onboarding.userRole).toBe(null);
            expect(v2.preferences.tailor.outputLanguage).toBe('English');
            expect(v2.preferences.tailor.programmingLanguage).toBe('Python');
            expect(v2.preferences.tailor.audioLanguage).toBe('en');
            expect(v2.preferences.tailor.customPrompt).toBe(null);

            expect(v2.access.planId).toBe('free');
            expect(v2.access.accessStatus).toBe('active');
            expect(v2.access.features).toEqual({});
            expect(v2.access.concurrencyLimit).toBe(1);

            expect(v2.usage.quotaSecondsMonth).toBe(3600);
            expect(v2.usage.quotaSecondsUsed).toBe(0);

            expect(v2.billing.stripeCustomerId).toBe(null);
            expect(v2.billing.subscriptionId).toBe(null);
            expect(v2.billing.billingStatus).toBe('active');

            expect(v2.security.lastLoginIp).toBe(null);
            expect(v2.security.lastLoginUserAgent).toBe(null);
        });

        it('should handle features as non-array (already object)', () => {
            const userWithObjectFeatures = {
                email: 'test@example.com',
                createdAt: new Date(),
                features: { audio: true, video: false },
            };

            const v2 = migrateUserToV2(userWithObjectFeatures);

            // Should keep the object as-is
            expect(v2.access.features).toEqual({ audio: true, video: false });
        });

        it('should handle empty features array', () => {
            const userWithEmptyFeatures = {
                email: 'test@example.com',
                createdAt: new Date(),
                features: [],
            };

            const v2 = migrateUserToV2(userWithEmptyFeatures);

            expect(v2.access.features).toEqual({});
        });

        it('should handle undefined features', () => {
            const userWithNoFeatures = {
                email: 'test@example.com',
                createdAt: new Date(),
            };

            const v2 = migrateUserToV2(userWithNoFeatures);

            expect(v2.access.features).toEqual({});
        });

        it('should preserve quotaResetAt if present', () => {
            const resetDate = new Date('2024-12-01');
            const user = {
                email: 'test@example.com',
                createdAt: new Date(),
                quotaResetAt: resetDate,
            };

            const v2 = migrateUserToV2(user);

            expect(v2.usage.quotaResetAt).toEqual(resetDate);
        });

        it('should handle null features gracefully', () => {
            const userWithNullFeatures = {
                email: 'test@example.com',
                createdAt: new Date(),
                features: null,
            };

            const v2 = migrateUserToV2(userWithNullFeatures);

            expect(v2.access.features).toEqual({});
        });
    });
});
