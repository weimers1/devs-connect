import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StytchProvider } from "@stytch/react";
import { StytchUIClient } from "@stytch/vanilla-js";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "../Components/Auth/AuthContext.tsx";

const stytchToken = import.meta.env.VITE_STYTCH_PUBLIC_TOKEN;
if (!stytchToken) {
    throw new Error('Stytch public token not found in environment variables');
}

const stytch = new StytchUIClient(stytchToken);

const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error('Root element not found');
}

try {
    createRoot(rootElement).render(
        <StrictMode>
            <StytchProvider stytch={stytch}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </StytchProvider>
        </StrictMode>
    );
} catch (error) {
    console.error('Failed to render application:', error);
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Failed to load application. Please refresh the page.</div>';
}
