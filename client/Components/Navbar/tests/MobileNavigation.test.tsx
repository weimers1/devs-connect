import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import { DropdownProvider } from '../../DropDown/DropDownContext';
import { useAuth } from '../../Auth/AuthContext';
import API from '../../../Service/service';

jest.mock('../../Auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../../Service/service', () => ({
    __esModule: true,
    default: { getProfileInformation: jest.fn() },
}));
jest.mock('../../../Utils/routes', () => ({
    defaultRoutes: [
        { path: '/', title: 'Home', icon: 'mdi:home', showInNav: true },
        { path: '/communities', title: 'Communities', icon: 'mdi:account-group', showInNav: true },
    ],
    protectedRoutes: [
        { path: '/projects', title: 'Projects', icon: 'mdi:rocket', showInNav: true },
        { path: '/messages', title: 'Messages', icon: 'mdi:message', showInNav: true },
        { path: '/Create', title: 'Create', icon: 'mdi:plus', showInNav: true },
        { path: '/profile', title: 'Profile', icon: 'mdi:account', showInNav: true },
    ],
}));

const mockUseAuth = jest.mocked(useAuth);
const mockGetProfile = jest.mocked(API.getProfileInformation);
const logout = jest.fn().mockResolvedValue(undefined);

function LocationDisplay() {
    return <span data-testid="location">{useLocation().pathname}</span>;
}

function renderNavbar(authenticated = true) {
    mockUseAuth.mockReturnValue({
        isAuthenticated: authenticated,
        isLoading: false,
        login: jest.fn(),
        logout,
    });
    return render(
        <MemoryRouter>
            <DropdownProvider>
                <Navbar />
                <LocationDisplay />
            </DropdownProvider>
        </MemoryRouter>,
    );
}

beforeEach(() => {
    mockGetProfile.mockResolvedValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        pfp: '',
    } as Awaited<ReturnType<typeof API.getProfileInformation>>);
});

test('mobile bottom navigation is available alongside the profile menu', async () => {
    renderNavbar();
    const profileButton = screen.getByRole('button', { name: 'Open profile menu' });
    const navigation = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(navigation).toHaveClass('fixed', 'bottom-0', 'md:hidden');
    expect(within(navigation).getAllByRole('link')).toHaveLength(6);
    expect(within(navigation).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(profileButton);
    expect(profileButton).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Help & Support' })).toBeInTheDocument();

    fireEvent.click(within(navigation).getByRole('link', { name: 'Projects' }));
    expect(profileButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('location')).toHaveTextContent('/projects');
    expect(within(navigation).getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    fireEvent.click(profileButton);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(profileButton).toHaveAttribute('aria-expanded', 'false');
});

test('profile links navigate and close the dropdown', async () => {
    renderNavbar();
    const profileButton = screen.getByRole('button', { name: 'Open profile menu' });
    fireEvent.click(profileButton);
    await screen.findByText('test@example.com');
    fireEvent.click(screen.getByRole('link', { name: 'Settings' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/settings');
    expect(profileButton).toHaveAttribute('aria-expanded', 'false');
});

test('signed-out mobile navigation retains the login link', () => {
    renderNavbar(false);
    expect(screen.queryByRole('button', { name: 'Open profile menu' })).not.toBeInTheDocument();
    const navigation = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(within(navigation).getAllByRole('link')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Login' })[0]).toHaveAttribute('href', '/login');
    expect(screen.getAllByRole('button', { name: 'Switch language' })).toHaveLength(2);
});
