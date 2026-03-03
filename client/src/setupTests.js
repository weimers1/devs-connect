// Jest setup file - runs before all tests

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
globalThis.IntersectionObserver = class {
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver
globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
  unobserve() {}
};
