import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PreRegisterForm from './PreRegisterForm';
import * as Firestore from 'firebase/firestore';
import { trackEvent } from '../lib/analytics';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    doc: vi.fn(() => ({})),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    serverTimestamp: vi.fn(),
}));

// Mock firebase lib
vi.mock('../lib/firebase', () => ({
    db: {},
}));

// Mock Analytics import
vi.mock('../lib/analytics', () => ({
    trackEvent: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('PreRegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows error for invalid email', async () => {
        const { container } = render(
            <BrowserRouter>
                <PreRegisterForm source="hero" />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('Enter your email');

        fireEvent.change(input, { target: { value: 'invalid-email' } });

        const form = container.querySelector('form');
        if (form) fireEvent.submit(form);

        expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('submits valid email and handles intent', async () => {
        const { container } = render(
            <BrowserRouter>
                <PreRegisterForm source="hero" />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('Enter your email');

        vi.mocked(Firestore.setDoc).mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
        });

        fireEvent.change(input, { target: { value: 'test@example.com' } });

        const form = container.querySelector('form');
        if (form) fireEvent.submit(form);

        // Check loading state
        expect(await screen.findByText('Joining...')).toBeInTheDocument();

        // Wait for qualifier step
        expect(await screen.findByText('What are you preparing for?')).toBeInTheDocument();
        expect(Firestore.setDoc).toHaveBeenCalled();

        // Select an intent
        fireEvent.click(screen.getByText('FAANG'));

        // Should update doc and navigate
        await waitFor(() => {
            expect(Firestore.updateDoc).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/success?email=test%40example.com');
        });
    });

    it('includes tracking props in signup and qualifier events', async () => {
        const trackingProps = { experiment_id: 'test_exp', variant_id: 'B' };
        const { container } = render(
            <BrowserRouter>
                <PreRegisterForm source="hero" trackingProps={trackingProps} />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText('Enter your email');
        fireEvent.change(input, { target: { value: 'tracking@example.com' } });

        const form = container.querySelector('form');
        if (form) fireEvent.submit(form);

        await waitFor(() => {
            expect(Firestore.setDoc).toHaveBeenCalledWith(
                expect.any(Object),
                expect.objectContaining({
                    email: 'tracking@example.com',
                    ...trackingProps,
                })
            );
        });

        // Check Analytics for sign_up
        await waitFor(() => {
            expect(trackEvent).toHaveBeenCalledWith(
                'sign_up',
                expect.objectContaining({
                    source: 'hero',
                    ...trackingProps,
                })
            );
        });

        // Wait for qualifier step
        expect(await screen.findByText('What are you preparing for?')).toBeInTheDocument();
        fireEvent.click(screen.getByText('FAANG'));

        // Check Analytics for qualifier
        await waitFor(() => {
            expect(trackEvent).toHaveBeenCalledWith(
                'qualifier_submitted',
                expect.objectContaining({
                    intent: 'FAANG',
                    ...trackingProps,
                })
            );
        });
    });
});
