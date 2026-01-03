import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { vi, describe, it, expect } from 'vitest';

// Dependency mocks
vi.mock('./lib/firebase', () => ({
    auth: {},
    db: {},
    analytics: {},
}));

vi.mock('./hooks/useAuth', () => ({
    useAuth: () => ({
        user: null,
        loading: false,
    }),
}));

vi.mock('./hooks/usePageTracking', () => ({
    usePageTracking: vi.fn(),
}));

vi.mock('./hooks/useScrollTracking', () => ({
    useScrollTracking: vi.fn(),
}));

vi.mock('./hooks/useExitTracking', () => ({
    useExitTracking: vi.fn(),
}));

// Mock child pages to avoid testing their complexity here
vi.mock('./pages/HomePage', () => ({ default: () => <div data-testid="home-page">Home Page</div> }));
vi.mock('./pages/SignInPage', () => ({ default: () => <div>Sign In Page</div> }));

// Mock BrowserRouter to allow testing history/location if needed,
// or just to function within test environment without browser APIs.
// Vitest environment is jsdom, so BrowserRouter works, but we can't easily push history to it from outside.
// However, since App defines the Router, we just test default render.

describe('App', () => {
    it('renders home page by default', async () => {
        // We might need to mock window.location.pathname before render to test other routes
        // But App uses BrowserRouter, which uses window.history.

        // Ensure we are at root
        window.history.pushState({}, 'Test', '/');

        render(<App />);

        expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
});
