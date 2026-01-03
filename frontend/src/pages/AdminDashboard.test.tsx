import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { MemoryRouter } from 'react-router-dom';
import * as Firestore from 'firebase/firestore';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
    auth: { signOut: vi.fn() },
}));

vi.mock('firebase/firestore', async importOriginal => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        collection: vi.fn(),
        query: vi.fn(),
        getDocs: vi.fn(),
        orderBy: vi.fn(),
    };
});

// Mock Recharts
vi.mock('recharts', () => {
    const ResponsiveContainer = ({ children }) => <div className="recharts-responsive-container">{children}</div>;
    return {
        ResponsiveContainer,
        LineChart: () => <div>LineChart</div>,
        BarChart: () => <div>BarChart</div>,
        Line: () => null,
        Bar: () => null,
        XAxis: () => null,
        YAxis: () => null,
        CartesianGrid: () => null,
        Tooltip: () => null,
        Legend: () => null,
    };
});

describe('AdminDashboard', () => {
    it('shows loading state initially', () => {
        // Mock getDocs to never resolve (or take time) to check loading
        // Actually, component sets loading=true initially.
        // We need to act quickly or mock state?
        // Let's just mock getDocs to return empty data but wrapped in promise
        vi.mocked(Firestore.getDocs).mockImplementation(() => new Promise(() => {}));

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        // The dashboard has a skeleton loader structure, look for animate-pulse or specific class
        const pulses = document.querySelectorAll('.animate-pulse');
        expect(pulses.length).toBeGreaterThan(0);
    });

    it('renders dashboard content after data load', async () => {
        // Mock data
        const mockSnapshot = {
            docs: [{ id: '1', data: () => ({ email: 'test@test.com', source: 'hero', createdAt: { toDate: () => new Date() } }) }],
        };
        vi.mocked(Firestore.getDocs).mockResolvedValue(mockSnapshot as any);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('test@test.com')).toBeInTheDocument();
        });
    });
});
