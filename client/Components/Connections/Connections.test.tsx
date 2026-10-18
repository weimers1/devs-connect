import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useLocation } from "react-router-dom";
import Connections from "./Connections";

const LocationDisplay = () => {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
};

jest.mock("../Layout", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
});

jest.mock("@iconify/react/dist/iconify.js", () => ({
  Icon: () => null,
}));

jest.mock("../Auth/useAuthRedirect", () => ({
  useAuthRedirect: () => ({ requireAuth: (callback: () => void) => callback() }),
}));

jest.mock("../../Service/service", () => ({
  __esModule: true,
  default: {
    getOtherUserConnections: jest.fn(),
  },
}));

jest.mock("./UserConnectionContext.tsx", () => ({
  useUserConnections: () => ({
    connections: [],
    currentUser: "1",
    handleConnect: jest.fn(),
    handleDisconnect: jest.fn(),
    handleBlockUser: jest.fn(),
    suggestionData: [
      {
        author: "Ada Lovelace",
        userId: "2",
        publicId: "aabbccdd-1234-4abc-8abc-1234567890ab",
        age: "",
        profileImageUrl: "",
        career: "Software Engineer",
        school: "",
      },
    ],
    isLoadingConnections: false,
    isLoadingSuggestions: false,
    suggestionsError: null,
    connectingUserId: null,
    connectionError: null,
  }),
}));

describe("Connections", () => {
  it("shows recommendations separately when the connection list is empty", () => {
    render(
      <MemoryRouter initialEntries={["/connections"]}>
        <Connections />
        <LocationDisplay />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Your network" })).toBeInTheDocument();
    expect(screen.getByText("Your network starts here")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "People you may know" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("uses the public UUID for profile links", async () => {
    render(
      <MemoryRouter initialEntries={["/connections"]}>
        <Connections />
        <LocationDisplay />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "View Ada Lovelace's profile" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-path")).toHaveTextContent(
        "/profile/aabbccdd-1234-4abc-8abc-1234567890ab",
      );
    });
  });
});
