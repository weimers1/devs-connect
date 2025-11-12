export default {
  // Enable ES modules support
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Test environment - jsdom simulates browser environment
  testEnvironment: 'jsdom',
  
  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Module name mapping for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '@iconify/react': '<rootDir>/src/__mocks__/@iconify-react.js'
  },
  
  // Mock environment variables
  setupFiles: ['<rootDir>/src/__mocks__/env.js'],
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform files with these extensions
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: true,
      isolatedModules: true
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/Components/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/Components/**/*.(test|spec).(ts|tsx|js|jsx)'
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    'Components/**/*.{ts,tsx}',
    '!Components/**/*.d.ts',
    '!Components/**/__tests__/**',
    '!Components/**/node_modules/**'
  ],
  
  // Transform node_modules that use ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(@iconify/react|other-esm-packages)/)',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}