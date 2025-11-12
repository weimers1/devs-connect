// Mock environment variables for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_URL_CLIENT: 'http://localhost:5173',
        VITE_STYTCH_PUBLIC_TOKEN: 'test-token'
      }
    }
  }
});