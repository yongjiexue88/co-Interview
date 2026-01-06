import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReadingProgressBar from './ReadingProgressBar';
import React from 'react';

describe('ReadingProgressBar', () => {
    it('renders with 0 progress initially', () => {
        render(<ReadingProgressBar />);
        expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('updates progress on scroll (document context)', () => {
        const { unmount } = render(<ReadingProgressBar />);

        // Mock document dimensions
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });

        // Scroll to 50%
        act(() => {
            // max scrollable = 2000 - 1000 = 1000.  If we scroll to 500, that's 50%.
            Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
            window.dispatchEvent(new Event('scroll'));
        });

        expect(screen.getByText('50%')).toBeInTheDocument();

        unmount();
    });

    it('clamps progress to 0-100', () => {
        const { unmount } = render(<ReadingProgressBar />);

        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });

        // Scroll past end
        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 5000, configurable: true });
            window.dispatchEvent(new Event('scroll'));
        });
        expect(screen.getByText('100%')).toBeInTheDocument();

        // Scroll before start (negative?)
        act(() => {
            Object.defineProperty(window, 'scrollY', { value: -100, configurable: true });
            window.dispatchEvent(new Event('scroll'));
        });
        expect(screen.getByText('0%')).toBeInTheDocument();

        unmount();
    });

    it('calculates progress based on articleRef if provided', () => {
        const articleRef = { current: document.createElement('div') };
        // Mock layout values
        Object.defineProperty(articleRef.current, 'offsetTop', { value: 500 });
        Object.defineProperty(articleRef.current, 'offsetHeight', { value: 2000 });
        Object.defineProperty(window, 'innerHeight', { value: 1000 });

        // Start point = 500
        // End point = 500 + 2000 - 1000 = 1500
        // Total scrollable range = 1500 - 500 = 1000

        const { unmount } = render(<ReadingProgressBar articleRef={articleRef} />);

        // 1. Before article
        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
            window.dispatchEvent(new Event('scroll'));
        });
        expect(screen.getByText('0%')).toBeInTheDocument();

        // 2. Middle of article (scrollY = 1000)
        // Progress = (1000 - 500) / 1000 = 50%
        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true });
            window.dispatchEvent(new Event('scroll'));
        });
        expect(screen.getByText('50%')).toBeInTheDocument();

        // 3. Past article (scrollY = 2000)
        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 2000, configurable: true });
            window.dispatchEvent(new Event('scroll'));
        });
        expect(screen.getByText('100%')).toBeInTheDocument();

        unmount();
    });
    it('fallbacks to document scroll if articleRef.current is null', () => {
        const articleRef = { current: null };
        const { unmount } = render(<ReadingProgressBar articleRef={articleRef} />);

        // Mock document scroll height
        Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });

        // Scroll to 50%
        act(() => {
            Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
            window.dispatchEvent(new Event('scroll'));
        });

        expect(screen.getByText('50%')).toBeInTheDocument();
        unmount();
    });
});
