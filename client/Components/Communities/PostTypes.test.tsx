import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PostCard from './PostTypes';

const mockToggleSavedPost = jest.fn();
const mockGetPostComments = jest.fn();
const mockCommentOnPost = jest.fn();

jest.mock('../../Service/service', () => ({
    __esModule: true,
    default: {
        getLikes: jest.fn().mockResolvedValue({ like: { 'COUNT(*)': 0 } }),
        getLikeStatus: jest.fn().mockResolvedValue({ postLiked: false }),
        getCurrentUser: jest.fn().mockResolvedValue({ userId: 1 }),
        getProfileInformation: jest.fn().mockResolvedValue({
            pfp: '',
            firstName: 'Ada',
        }),
        toggleSavedPost: (...args: unknown[]) => mockToggleSavedPost(...args),
        getPostComments: (...args: unknown[]) => mockGetPostComments(...args),
        commentOnPost: (...args: unknown[]) => mockCommentOnPost(...args),
    },
}));

jest.mock('../Auth/AuthContext', () => ({
    useAuth: () => ({ isAuthenticated: false }),
}));

jest.mock('../Auth/useAuthRedirect', () => ({
    useAuthRedirect: () => ({
        requireAuth: (callback?: () => void) => {
            callback?.();
            return true;
        },
        isAuthenticated: true,
    }),
}));

describe('PostCard interactions', () => {
    const post = {
        id: 10,
        userId: 1,
        type: 'posts' as const,
        author: 'Ada Lovelace',
        avatar: '',
        timestamp: 'Today',
        content: 'A community post',
        likes: 0,
        comments: 0,
        tags: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockToggleSavedPost.mockResolvedValue({ saved: true });
        mockGetPostComments.mockResolvedValue([]);
        mockCommentOnPost.mockResolvedValue({ message: 'Comment added' });
    });

    it('saves a post and updates the bookmark control', async () => {
        render(
            <MemoryRouter>
                <PostCard post={post} />
            </MemoryRouter>,
        );

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Like post' })).toBeInTheDocument(),
        );
        fireEvent.click(screen.getByRole('button', { name: 'Save post' }));

        await waitFor(() => {
            expect(mockToggleSavedPost).toHaveBeenCalledWith('10');
            expect(screen.getByRole('button', { name: 'Unsave post' })).toBeInTheDocument();
        });
    });

    it('allows likes and comments when the viewer is not a community member', async () => {
        render(
            <MemoryRouter>
                <PostCard post={{ ...post, canInteract: false }} />
            </MemoryRouter>,
        );

        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Like post' })).toBeEnabled(),
        );
        fireEvent.click(screen.getByRole('button', { name: 'View comments' }));

        const commentBox = await screen.findByPlaceholderText('Write a comment...');
        fireEvent.change(commentBox, { target: { value: 'Helpful post!' } });
        fireEvent.click(screen.getByRole('button', { name: 'Comment' }));

        await waitFor(() =>
            expect(mockCommentOnPost).toHaveBeenCalledWith('10', 'Helpful post!'),
        );
    });
});
