import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPISummaryPanel, { UserData, AnalyticsEvent } from './KPISummaryPanel';
import { Timestamp } from 'firebase/firestore';

describe('KPISummaryPanel', () => {
    const mockUsers: UserData[] = [
        {
            id: '1',
            email: 'test1@example.com',
            source: 'google',
            createdAt: new Date().toISOString(), // recent
            intent: 'interview',
        },
        {
            id: '2',
            email: 'test2@example.com',
            source: 'linkedin',
            createdAt: '2020-01-01', // old
        },
        {
            id: '3',
            email: 'test3@example.com',
            source: 'google',
            createdAt: { toDate: () => new Date() } as Timestamp, // recent timestamp
            intent: 'job',
        },
    ];

    const mockEvents: AnalyticsEvent[] = [
        {
            id: 'e1',
            eventName: 'nav_click',
            params: { label: 'Pricing' },
            createdAt: new Date().toISOString(),
        },
        {
            id: 'e2',
            eventName: 'other_event',
            params: {},
            createdAt: new Date().toISOString(),
        },
    ];

    it('renders metrics correctly', () => {
        render(<KPISummaryPanel users={mockUsers} events={mockEvents} />);

        // Signups (7d): Both user 1 and 3 are recent. User 2 is old.
        // Expect +2
        expect(screen.getByText('+2')).toBeInTheDocument();

        // Qualified %: 2/3 users have intent. 67%?
        // 2/3 = 0.666 -> round to 67.
        expect(screen.getByText('67%')).toBeInTheDocument();
        expect(screen.getByText('2 qualified users')).toBeInTheDocument();

        // Top Source: google (2), linkedin (1). Expect 'google'.
        expect(screen.getByText('google')).toBeInTheDocument();

        // Pricing Interest: 1 event matches.
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('handles empty data', () => {
        render(<KPISummaryPanel users={[]} events={[]} />);
        expect(screen.getByText('+0')).toBeInTheDocument(); // Signups
        expect(screen.getByText('0%')).toBeInTheDocument(); // Qualified
        expect(screen.getByText('-')).toBeInTheDocument(); // Top Source (fallback)
        expect(screen.getByText('0')).toBeInTheDocument(); // Pricing
    });

    it('handles date edge cases', () => {
        const usersWithEdgeDates: UserData[] = [
            {
                id: '1',
                email: 'a@a.com',
                createdAt: undefined as any, // fallback to now
            },
        ];
        render(<KPISummaryPanel users={usersWithEdgeDates} events={[]} />);
        expect(screen.getByText('+1')).toBeInTheDocument(); // Defaults to now, which is < 7 days
    });
});
