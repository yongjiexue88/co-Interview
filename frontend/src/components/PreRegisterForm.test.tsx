import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PreRegisterForm from './PreRegisterForm';
import * as Firestore from 'firebase/firestore';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    doc: vi.fn(),
    setDoc: vi.fn(),
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

describe('PreRegisterForm', () => {
    it('shows error for invalid email', async () => {
        const { container } = render(<PreRegisterForm source="hero" />);

        const input = screen.getByPlaceholderText('Enter your email');

        fireEvent.change(input, { target: { value: 'invalid-email' } });

        const form = container.querySelector('form');
        if (form) fireEvent.submit(form);

        expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('submits valid email', async () => {
        const { container } = render(<PreRegisterForm source="hero" />);

        const input = screen.getByPlaceholderText('Enter your email');


        vi.mocked(Firestore.setDoc).mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        fireEvent.change(input, { target: { value: 'test@example.com' } });

        const form = container.querySelector('form');
        if (form) fireEvent.submit(form);

        // Check loading state
        expect(await screen.findByText('Joining...')).toBeInTheDocument();

        await waitFor(() => {
            expect(Firestore.setDoc).toHaveBeenCalled();
            expect(screen.getByText("You're on the list!")).toBeInTheDocument();
        });
    });
});
