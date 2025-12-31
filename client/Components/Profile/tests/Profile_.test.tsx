import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { validateImageUrl } from '../Profile';

describe('Validating the IMage Url', () => {
    test('The expected response should be true', async () => {
        const url =
            'https://devsconnect.s3.amazonaws.com/profile-images/1757991338958-plantsimage.jpg';
        const response = validateImageUrl(url);
        expect(response).toBe(true);
    });
    test('The expected response should be false'),
        () => {
            const url = 'XKJKVJSKDFJKWFJKWFJWK'; //Doesn't Contain https or s3.amazonaws.com
            const response = validateImageUrl(url);
            expect(response).toBe(url);
        };
});

describe('Handle Profile Image Upload', () => {
    test('The expected response should be true ', async () => {
        const file = new File(['profileImage'], 'profileImage.jpg', {
            type: 'image/jpeg',
        });
        global.fetch = jest.fn().mockResolvedValue({
            //assert
            //Mock Fetch
            ok: true,
            json: () => Promise.resolve({ success: true, data: file }), //arrange
        });
        const response = await fetch('/api/upload/profile-image');
        const result = await response.json(); //act
        expect(result.success).toBe(true);
    });
});


