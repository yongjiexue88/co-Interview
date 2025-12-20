import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PreviousVersionsPage from './PreviousVersionsPage';

describe('PreviousVersionsPage', () => {
    it('renders latest version section', () => {
        render(<PreviousVersionsPage />);

        expect(screen.getByText('Latest Version')).toBeInTheDocument();
        expect(screen.getByText('Interview Coder Pro 2.0')).toBeInTheDocument();
        expect(screen.getByText('v2.0.0')).toBeInTheDocument();
    });

    it('renders previous versions section', () => {
        render(<PreviousVersionsPage />);

        expect(screen.getByText('Previous Version')).toBeInTheDocument();
        expect(screen.getByText('Interview Coder 1.0')).toBeInTheDocument();
        expect(screen.getByText('v1.0.33')).toBeInTheDocument();
    });

    it('displays version descriptions', () => {
        render(<PreviousVersionsPage />);

        expect(screen.getByText('Audio support and upgraded undetectability and performance.')).toBeInTheDocument();
        expect(screen.getByText('Streaming answers, improved prompt engineering.')).toBeInTheDocument();
    });

    it('renders download buttons', () => {
        render(<PreviousVersionsPage />);

        const downloadButtons = screen.getAllByText('Download');
        expect(downloadButtons).toHaveLength(2); // One for latest, one for previous
    });

    it('renders version icons', () => {
        render(<PreviousVersionsPage />);

        const logos = screen.getAllByAltText(/Pro|Version/);
        expect(logos).toHaveLength(2);
    });
});
