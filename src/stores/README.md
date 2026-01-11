# Authentication Store

## Overview

The authentication store manages user authentication state using Pinia. It provides login, logout, and token verification functionality.

## Features

- **Login**: Authenticate users with email and password
- **Logout**: Clear authentication state and tokens
- **Token Verification**: Verify stored tokens on app initialization
- **Persistent State**: Store authentication data in localStorage
- **Route Protection**: Integrate with Vue Router for protected routes

## Usage

### In Components

```typescript
import { useAuth } from '@/composables/useAuth'

const { user, isAuthenticated, isAdmin, login, logout } = useAuth()

// Login
await login({ email: 'admin@example.com', password: 'password' })

// Logout
await logout()

// Check authentication status
if (isAuthenticated.value) {
  console.log('User is logged in:', user.value)
}
```

### Direct Store Access

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Access state
console.log(authStore.user)
console.log(authStore.isAuthenticated)

// Call actions
await authStore.login(credentials)
await authStore.logout()
```

## API Endpoints

The auth store expects the following API endpoints:

- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout (optional)
- `GET /api/auth/verify` - Verify token validity

## State Management

### State Properties

- `user`: Current authenticated user object
- `token`: JWT authentication token
- `loading`: Loading state for async operations
- `error`: Error message from failed operations

### Computed Properties

- `isAuthenticated`: Boolean indicating if user is logged in
- `isAdmin`: Boolean indicating if user has admin role

### Actions

- `login(credentials)`: Authenticate user
- `logout()`: Clear authentication state
- `verifyToken()`: Verify stored token
- `initializeAuth()`: Restore auth state from localStorage
- `clearError()`: Clear error messages

## Route Guards

The router automatically protects routes with `meta: { requiresAuth: true }`:

```typescript
{
  path: '/admin',
  component: AdminDashboard,
  meta: { requiresAuth: true }
}
```

Unauthenticated users are redirected to `/login`.
