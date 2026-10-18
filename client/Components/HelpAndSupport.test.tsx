import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpAndSupport from './HelpAndSupport';

const mockSubmitFeedback = jest.fn();

jest.mock('./Layout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../Service/service', () => ({
    __esModule: true,
    default: {
        submitFeedback: (...args: unknown[]) => mockSubmitFeedback(...args),
    },
}));

describe('Help and support', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubmitFeedback.mockResolvedValue({ message: 'Feedback sent' });
    });

    it('provides public direct feedback without requiring email app setup', () => {
        render(<HelpAndSupport />);

        expect(screen.getByRole('heading', { name: 'Help & Support' })).toBeInTheDocument();
        expect(screen.getByLabelText('Message')).toBeRequired();
        expect(screen.getByRole('button', { name: 'Send feedback' })).toBeDisabled();
        expect(
            screen.getByText('Enter at least 5 characters in your message to enable sending.')
        ).toBeInTheDocument();
        expect(screen.getByText(/don’t need to sign in/)).toBeInTheDocument();
    });

    it('explains when the message is long enough to send', () => {
        render(<HelpAndSupport />);
        fireEvent.change(screen.getByLabelText('Message'), {
            target: { value: 'Hi there' },
        });

        expect(screen.getByRole('button', { name: 'Send feedback' })).toBeEnabled();
        expect(screen.getByText('Your message is ready to send.')).toBeInTheDocument();
    });

    it('sends feedback directly and confirms successful delivery', async () => {
        render(<HelpAndSupport />);
        fireEvent.change(screen.getByLabelText('Message'), {
            target: { value: 'The page did not load.' },
        });
        fireEvent.change(screen.getByLabelText(/Your email/), {
            target: { value: 'user@example.com' },
        });
        fireEvent.change(screen.getByLabelText('What is this about?'), {
            target: { value: 'Bug report' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));

        await waitFor(() => {
            expect(mockSubmitFeedback).toHaveBeenCalledWith({
                category: 'Bug report',
                contactEmail: 'user@example.com',
                message: 'The page did not load.',
            });
        });
        expect(await screen.findByRole('status')).toHaveTextContent('Your feedback was sent');
    });

    it('shows an error if direct email delivery fails', async () => {
        mockSubmitFeedback.mockRejectedValue(
            new Error('Feedback email is temporarily unavailable')
        );
        render(<HelpAndSupport />);
        fireEvent.change(screen.getByLabelText('Message'), {
            target: { value: 'The page did not load.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Feedback email is temporarily unavailable'
        );
    });
});
