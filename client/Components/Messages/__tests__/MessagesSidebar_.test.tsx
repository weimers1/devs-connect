import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Create TestWrapper for Router Context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
);

//Import MessageSidebar
import MessageSidebar from '../MessageSidebar';

//Simulating Messages
const mockMessages = [
    {
        id: '1-2',
        name: 'John Doe',
        lastMessage: 'Hello',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
        unreadCount: 2,
        isOnline: false,
    },
    {
        id: '1-3',
        name: 'Jane Smith',
        lastMessage: 'Hello Friend!',
        timestamp: new Date('2024-01-15T09:15:00Z'),
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random',
        unreadCount: 2,
        isOnline: false,
    },
];

//  Creating Trackable Mock Functions
// We need to create the mock functions OUTSIDE so we can access them in tests
const mockSearchMessages = jest.fn();
const mockRefreshMessages = jest.fn();

// Mock the Login component to avoid import.meta issues
jest.mock('../../../Components/Login', () => {
    return function MockLogin() {
        return <div data-testid="mock-login">Login Component</div>;
    };
});

// Now mock the hook with our trackable functions
jest.mock('../hooks', () => ({
    useMessages: () => ({
        messages: mockMessages,
        isLoading: false,
        error: null,
        searchMessages: mockSearchMessages,
        refreshMessages: mockRefreshMessages,
    }),
}));

//  First Test
test('calls searchMessages (like Hello()) when John types', () => {
    // Mock functions for required props
    const mockOnMessageSelect = jest.fn();
    const mockSelectedMessage = null;

    // Render the MessageSidebar component with required props
    render( //Arrange
        <TestWrapper>
            <MessageSidebar
                onMessageSelect={mockOnMessageSelect}
                selectedMessage={mockSelectedMessage}
                onSearch={mockSearchMessages}
                messages={mockMessages}
            />
        </TestWrapper>
    );

    // Find the search input element
    const searchInput = screen.getByRole('textbox'); //Act

    // Simulate user typing "Hello"
    fireEvent.change(searchInput, { target: { value: 'Hello' } }); //ACt

    // Check if component called our mock function
    expect(mockSearchMessages).toHaveBeenCalledWith('Hello');//Assert
});
// Clean up DOM between tests
afterEach(() => {
    document.body.innerHTML = ''; // Clear all rendered components
});

//  2nd Test
test('pops up John messages when searching for john', () => {
    // Mock functions for required props
    const mockOnMessageSelect = jest.fn();
    const mockSelectedMessage = null;

    const FilteredMessages = mockMessages.filter((msg) =>
        msg.name.toLowerCase().includes('john')
    );
    
    // Render the MessageSidebar component with required props
    render( //
        <TestWrapper>
            <MessageSidebar
                onMessageSelect={mockOnMessageSelect}
                selectedMessage={mockSelectedMessage}
                onSearch={mockSearchMessages}
                messages={FilteredMessages}
            />
        </TestWrapper>
    );
    //  Let's see what's actually rendered
    screen.debug(); // This will show you the entire DOM

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hello Friend!')).toBeInTheDocument();
});

//Test 3 Filtering
test('testing just john and his message appears', () => {
  const FilterMessage = mockMessages.filter(msg => 
    msg.name.toLowerCase().includes('john')
  );

  expect(FilterMessage).toHaveLength(1);
  expect(FilterMessage[0].name).toBe('John Doe');
  expect(FilterMessage[0].lastMessage).toBe('Hello');
});