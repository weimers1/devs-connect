import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Messages from '../Messages';

const mockSendMessage = jest.fn();
const mockRefreshMessages = jest.fn();

jest.mock('../../Layout', () => {
    const React = jest.requireActual<typeof import('react')>('react');
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children);
});

jest.mock('../../../Service/service', () => ({
    __esModule: true,
    default: {
        getCurrentUser: jest.fn().mockResolvedValue({ userId: 1 }),
        getUserProfile: jest.fn().mockResolvedValue({
            firstName: 'Ada',
            lastName: 'Lovelace',
            pfp: '',
        }),
        getUserProfileByInternalId: jest.fn().mockResolvedValue({
            firstName: 'Ada',
            lastName: 'Lovelace',
            pfp: '',
        }),
    },
}));

jest.mock('../hooks', () => ({
    useMessages: () => ({
        messages: [],
        isLoading: false,
        error: null,
        searchMessages: jest.fn(),
        refreshMessages: mockRefreshMessages,
        socket: null,
    }),
    useChat: () => ({
        chatMessages: [],
        sendMessage: mockSendMessage,
        isLoading: false,
        error: null,
    }),
}));

jest.mock('../MessageSidebar', () => () => null);

jest.mock('../MessagesContent', () => {
    const React = jest.requireActual<typeof import('react')>('react');
    return {
        __esModule: true,
        default: ({
            selectedMessage,
            onSendMessage,
        }: {
            selectedMessage: unknown;
            onSendMessage: (content: string) => Promise<void>;
        }) =>
            React.createElement(
                'button',
                {
                    type: 'button',
                    disabled: !selectedMessage,
                    onClick: () => onSendMessage('Hello'),
                },
                'Send test message',
            ),
    };
});

describe('Messages', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSendMessage.mockResolvedValue(undefined);
        mockRefreshMessages.mockResolvedValue(undefined);
    });

    it('refreshes the conversation list after sending a message', async () => {
        render(
            <MemoryRouter initialEntries={['/messages?user=2']}>
                <Messages />
            </MemoryRouter>,
        );

        const sendButton = screen.getByRole('button', { name: 'Send test message' });
        await waitFor(() => expect(sendButton).toBeEnabled());
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith('Hello');
            expect(mockRefreshMessages).toHaveBeenCalledTimes(1);
        });
    });
});
