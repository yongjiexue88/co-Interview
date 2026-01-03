import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedAdminRoute from './ProtectedAdminRoute';
import { describe, it, expect, vi } from 'vitest';
import * as UseAuth from '../hooks/useAuth';

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

// Mock firebase lib for Sign Out button
vi.mock('../lib/firebase', () => ({
    auth: { signOut: vi.fn() },
}));

const AdminDashboard = () => <div>Admin Dashboard Content</div>;
const Login = () => <div>Login Page</div>;

describe('ProtectedAdminRoute', () => {
    it('shows loader when loading', () => {
        vi.mocked(UseAuth.useAuth).mockReturnValue({ user: null, loading: true });
        render(
            <MemoryRouter>
                <ProtectedAdminRoute />
            </MemoryRouter>
        );
        // Look for the loader or parent div structure if no text is present
        // The loader has specific class names we can query or just check for absence of other content
        // In the code: <Loader2 ... />
        const loader = document.querySelector('.animate-spin');
        expect(loader).toBeInTheDocument();
    });

    it('redirects to login if not authenticated', () => {
        vi.mocked(UseAuth.useAuth).mockReturnValue({ user: null, loading: false });
        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/admin" element={<ProtectedAdminRoute />}>
                        <Route path="" element={<AdminDashboard />} />
                    </Route>
                    <Route path="/admin/login" element={<Login />} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('shows Access Denied if email is not in ADMIN_EMAILS', () => {
        vi.mocked(UseAuth.useAuth).mockReturnValue({
            user: { email: 'random@example.com' } as any,
            loading: false,
        });

        render(
            <MemoryRouter>
                <ProtectedAdminRoute />
            </MemoryRouter>
        );

        expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
        expect(screen.getByText(/random@example.com/)).toBeInTheDocument();
    });

    it('renders Outlet (dashboard) if authorized', () => {
        vi.mocked(UseAuth.useAuth).mockReturnValue({
            user: { email: 'yongjiexue88@gmail.com' } as any,
            loading: false,
        });

        render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route path="/admin" element={<ProtectedAdminRoute />}>
                        <Route path="" element={<AdminDashboard />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Admin Dashboard Content')).toBeInTheDocument();
    });
});
