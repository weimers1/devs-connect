import Navbar from "../Navbar"
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { act } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import userEvent from '@testing-library/user-event'
import { AuthProvider } from "../../Auth/AuthContext";


const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
};

describe("Testing Navigation Links from the user", () => {
        test("when a user clicks on the navigation link it directs them to that location",async ()=> {
            render(
                <MemoryRouter initialEntries={["/"]}>
                    <AuthProvider>
                        <Navbar />
                        <LocationDisplay />
                    </AuthProvider>
                </MemoryRouter>
            )

               const link = screen.getByText("Communities");

              await userEvent.click(link);

              expect(screen.getByTestId('location-display')).toHaveTextContent('/communities');
        })
         test("when a user isn't authenticated they should be only at the login page | Message isn't an option",async ()=> {

            render(
                <MemoryRouter>
                        <AuthProvider>
                        <Navbar />
                        <LocationDisplay />
                        </AuthProvider>
                </MemoryRouter>
            )
           expect(screen.queryByText("Message")).not.toBeInTheDocument();
           expect(screen.getByText('Login')).toBeInTheDocument();

        })
})

