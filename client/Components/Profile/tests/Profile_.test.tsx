import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile, {validateImageUrl}  from "../Profile"
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../Auth/AuthContext';

// Create TestWrapper for Router Context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
);


describe("Profile Component", () => {
    //Testing the Validate Image URL function for the Profile Component
        test("Validating IMG URL", () => {
            const validImgURl = "https://supersecureimage.amazonaws.com/image.png";

            const result =  validateImageUrl(validImgURl);

            expect(result).toBe(true);
        })
        test("Invalidating Img URL", () => {
            const invalidIMGURL = "http://localhost";

            const result = validateImageUrl(invalidIMGURL);

            expect(result).toBe(false);
        })

        test("Handle Image Upload", async () => {
            render(
            <TestWrapper>
                <AuthProvider>
             <Profile/>
             </AuthProvider>
            </TestWrapper>
            )
            window.location.href = "/profile?showCertModal=true"

            const file = new File(["foo"], "foo.txt", {
                    type: "image/png"
                });

                const results = screen.getByTestId("profile-upload-input");

                const result = fireEvent.change(results, {file});

                fireEvent.click(screen.getByTestId("profile-upload-button"));

                expect(result).toBeInstanceOf(Promise);
        })
    })  




 