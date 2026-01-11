// Jest setup file for integration tests
// This file runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  generateUniqueEmail: () => `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
  generateFutureDate: (daysFromNow) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }
};
