# Integration Tests Documentation

## Overview

This directory contains comprehensive integration tests for the Aiyunxiangshe Booking System. The tests validate the complete booking workflows, admin functionality, and error recovery mechanisms.

## Test Files

### `integration.test.js`

Complete end-to-end integration tests covering:

- Room booking flow
- Restaurant booking flow
- Admin backend functionality
- Error recovery and data consistency
- Real-time sync validation

### `db.test.js`

Property-based tests for database persistence consistency.

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- integration.test.js

# Run with verbose output
npm test -- --verbose

# Run with coverage
npm test -- --coverage
```

## Test Coverage

### 1. Complete Room Booking Flow (5 tests)

- ✓ Display room information
- ✓ Check room availability
- ✓ Create room booking
- ✓ Retrieve booking details
- ✓ Prevent double booking

**Validates Requirements:** 2.1, 2.2, 2.3, 2.4

### 2. Complete Restaurant Booking Flow (8 tests)

- ✓ Display restaurant content
- ✓ Display cuisines
- ✓ Display meal packages
- ✓ Display time slots
- ✓ Check restaurant availability
- ✓ Create restaurant booking
- ✓ Retrieve booking details
- ✓ Prevent overbooking time slots

**Validates Requirements:** 3.1, 3.2, 3.3, 3.4, 3.5

### 3. Admin Backend Functionality (6 tests)

- ✓ View all room bookings
- ✓ View restaurant bookings
- ✓ Update room type
- ✓ Create time slot
- ✓ Update content
- ✓ Prevent non-admin access

**Validates Requirements:** 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4

### 4. Error Recovery and Data Consistency (5 tests)

- ✓ Handle invalid booking dates
- ✓ Handle missing required fields
- ✓ Handle non-existent resources
- ✓ Maintain data consistency after cancellation
- ✓ Handle concurrent booking attempts

**Validates Requirements:** 6.3, 6.4, 7.3, 7.4

### 5. End-to-End Booking Workflow (1 test)

- ✓ Complete user journey from browsing to confirmation

**Validates:** Complete booking flow integration

## Test Results

```
Test Suites: 1 passed, 1 total
Tests:       25 passed, 25 total
Time:        ~3.6s
```

## Test Data Management

The tests use a comprehensive setup and teardown process:

### Setup (beforeAll)

- Creates test customer and admin users
- Generates authentication tokens
- Creates test room types and rooms
- Creates test cuisines and meal packages
- Creates test time slots

### Teardown (afterAll)

- Removes all test bookings
- Removes test rooms and room types
- Removes test meal packages and cuisines
- Removes test time slots
- Removes test users
- Closes database connection

## Key Features Tested

### 1. Authentication & Authorization

- JWT token generation and validation
- Role-based access control (customer vs admin)
- Protected endpoint access

### 2. Booking Logic

- Availability checking
- Double booking prevention
- Capacity management
- Concurrent booking handling

### 3. Data Consistency

- Database persistence
- Transaction integrity
- Cancellation handling
- Real-time state updates

### 4. Error Handling

- Invalid input validation
- Missing field detection
- Non-existent resource handling
- Graceful error responses

## Configuration

### Jest Configuration (`jest.config.js`)

- Test environment: Node.js
- Timeout: 30 seconds per test
- Coverage directory: `coverage/`
- Setup file: `tests/setup.js`

### Environment Variables

Tests use the same database configuration as the development environment. Ensure your `.env` file is properly configured before running tests.

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: All test data is cleaned up after tests complete
3. **Real Data**: Tests use real database operations, not mocks
4. **Comprehensive**: Tests cover happy paths, edge cases, and error scenarios
5. **Fast**: Tests complete in under 4 seconds

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and accessible at the configured host and port.

### Authentication Failures

Check that JWT secret is properly configured in environment variables.

### Timeout Errors

Increase the timeout in `jest.config.js` if tests are timing out on slower systems.

## Future Enhancements

- Add WebSocket real-time sync tests
- Add file upload integration tests
- Add performance benchmarking tests
- Add load testing scenarios
