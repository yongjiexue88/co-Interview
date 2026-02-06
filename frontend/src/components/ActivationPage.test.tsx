import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActivationPage from './ActivationPage';
import { MemoryRouter } from 'react-router-dom';
import * as analytics from '../lib/analytics';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../lib/analytics', () => ({
    trackEvent: vi.fn(),
}));

vi.mock('./Navbar', () => ({
    default: () => <div data-testid="navbar" />,
}));
vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer" />,
}));

describe('ActivationPage', () => {
    it('renders and displays email from search params', () => {
        render(
            <MemoryRouter initialEntries={['/success?email=test@example.com']}>
                <ActivationPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/You're on the list/i)).toBeInTheDocument();
        expect(screen.getAllByText(/free trial/i).length).toBeGreaterThan(0);
    });

    it('navigates to signup on button click', () => {
        render(
            <MemoryRouter initialEntries={['/success?email=test@example.com']}>
                <ActivationPage />
            </MemoryRouter>
        );

        const button = screen.getByRole('button', { name: /Create Your Account/i });
        fireEvent.click(button);

        expect(analytics.trackEvent).toHaveBeenCalledWith('activation_create_account_click', { source: 'activation_page' });
        expect(mockNavigate).toHaveBeenCalledWith('/signup?email=test%40example.com');
    });

    it('renders "How it works" section', () => {
        render(
            <MemoryRouter>
                <ActivationPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/How it works/i)).toBeInTheDocument();
        expect(screen.getByText(/Connects to call/i)).toBeInTheDocument();
    });
});
