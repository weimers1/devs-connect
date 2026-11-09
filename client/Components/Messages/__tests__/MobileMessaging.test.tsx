import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Messages from '../Messages';

const mockRefresh = jest.fn().mockResolvedValue(undefined);
const mockSend = jest.fn().mockResolvedValue(undefined);
const mockSetActiveChat = jest.fn();
const mockSearch = jest.fn();
const mockConversation = {
    id: '1-2',
    userId: '2',
    publicId: '123e4567-e89b-42d3-a456-426614174000',
    name: 'Ada Lovelace',
    lastMessage: 'Hello',
    timestamp: new Date('2026-01-01T10:00:00Z'),
    avatar: '',
};

jest.mock('../../Layout', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('../../../Service/service', () => ({
    __esModule: true,
    default: { getCurrentUser: jest.fn().mockResolvedValue({ userId: 1 }) },
}));
jest.mock('../hooks', () => ({
    useMessages: () => ({
        messages: [mockConversation],
        isLoading: false,
        error: null,
        searchMessages: mockSearch,
        refreshMessages: mockRefresh,
        setActiveChatUserId: mockSetActiveChat,
        socket: null,
    }),
    useChat: () => ({
        chatMessages: [],
        sendMessage: mockSend,
        isLoading: false,
        error: null,
        isOtherTyping: false,
    }),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

test('mobile inbox opens a conversation, sends a message and returns to the list', async () => {
    render(
        <MemoryRouter initialEntries={['/messages']}>
            <Messages />
        </MemoryRouter>,
    );
    await act(async () => {});

    const inbox = screen.getByRole('complementary');
    expect(inbox).toHaveClass('flex');
    fireEvent.click(screen.getByRole('button', { name: /Ada Lovelace/ }));
    expect(inbox).toHaveClass('hidden', 'lg:flex');
    expect(screen.getByRole('button', { name: 'Back to conversations' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Type a message' }), {
        target: { value: 'Hello Ada' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    await waitFor(() => expect(mockSend).toHaveBeenCalledWith('Hello Ada'));
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Back to conversations' }));
    expect(inbox).toHaveClass('flex');
    expect(inbox).not.toHaveClass('hidden');
    fireEvent.click(screen.getByRole('button', { name: /Ada Lovelace/ }));
    expect(inbox).toHaveClass('hidden');
});

test('mobile inbox keeps refresh and search accessible', async () => {
    render(
        <MemoryRouter initialEntries={['/messages']}>
            <Messages />
        </MemoryRouter>,
    );
    await act(async () => {});

    const inbox = screen.getByRole('complementary');
    const refresh = screen.getAllByRole('button', { name: 'Refresh' }).find((button) => inbox.contains(button));
    expect(refresh).toBeDefined();
    fireEvent.click(refresh!);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search conversations' }), {
        target: { value: 'Ada' },
    });
    expect(mockSearch).toHaveBeenCalledWith('Ada');
    await waitFor(() => expect(mockSetActiveChat).toHaveBeenCalled());
});
