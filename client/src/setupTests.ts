// Jest setup file - runs before all tests
import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder for Node.js environment
if (typeof globalThis.TextEncoder === 'undefined') {
  const util = require('util');
  globalThis.TextEncoder = util.TextEncoder;
  globalThis.TextDecoder = util.TextDecoder;
}

// Mock window.matchMedia (used by some UI libraries)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
(globalThis as any).IntersectionObserver = class {
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver
(globalThis as any).ResizeObserver = class {
  observe() {}
  disconnect() {}
  unobserve() {}
};