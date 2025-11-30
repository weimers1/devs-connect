import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
//Complex Import Needed For Test
import MessagesContent from '../MessagesContent';

// Create TestWrapper for Router Context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
);

const mockCommunications = [
    {
        id: '2-1',
        timestamp: new Date('2025-05-15'),
        content: 'Hello Friends!',
        isOwn: true,
        status: 'sent' as const,
    },
    {
        id: '1-2',
        timestamp: new Date('2025-05-15'),
        content: 'Hello!',
        isOwn: false,
        status: 'sent' as const,
    },
];

const mocksendMessage = jest.fn();

const mockfetchChatMessages = jest.fn();

//Mock the useChat function from the hooks component.
jest.mock('../hooks', () => ({
    useChat: (id: string) => ({
        chatMessages: mockCommunications,
        isLoading: false,
        error: null,
        sendMessage: mocksendMessage,
        fetchChatMessages: mockfetchChatMessages,
    }),
}));

test('User is Able to type in the search box', () => {
    //Mock function
    const handleBackToList = jest.fn();
    const handleSelectMessage = {
        id: '1-2',
        name: 'John doe',
        avatar: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        lastMessage: 'Hello!',
        timestamp: new Date('2025-05-51'),
        isOwn: false,
        status: 'sent' as const,
    };
    const handleSendMessage = async (message: string) => {
        mocksendMessage(message);
    };
    render(
        <TestWrapper>
            <MessagesContent
                selectedMessage={handleSelectMessage}
                onBackToList={handleBackToList}
                messages={mockCommunications}
                onSendMessage={handleSendMessage}
            />
        </TestWrapper>
    );
    const inputElement = screen.getByPlaceholderText('Type a message...');

    fireEvent.change(inputElement, {
        target: { value: 'Hello Messages Content' },
    });

    const sendButton = screen.getByTestId('send-button');

    fireEvent.click(sendButton);

    expect(mocksendMessage).toHaveBeenCalledWith('Hello Messages Content');
});


test('User is able to send a message', () => {
    
    const handleBacklist = jest.fn();
    const handleSelectMessages = {
        id: '1-2',
        name: 'John doe',
        avatar: '304200420',
        lastMessage: 'Hello!',
        timestamp: new Date('2005-05-14'),
        isOwn: false,
        status: 'sent' as const,
     };

     const handleSendMessage = async (message: string) => {
        mocksendMessage(message);
    };

    render(
        <TestWrapper>
            <MessagesContent
                selectedMessage={handleSelectMessages}
                onBackToList={handleBacklist}
                messages={mockCommunications}
                onSendMessage={handleSendMessage}
            />
        </TestWrapper>
    );

    

    const sendButton = screen.getByTestId('send-button');

    fireEvent.click(sendButton);

    expect(mocksendMessage).toHaveBeenCalledWith('Hello Messages Content');

})
