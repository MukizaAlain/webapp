# API Documentation

This document provides an overview of the available API endpoints in the Web Application Project.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| POST | `/api/auth/register` | Register a new user | `{ username, email, password, firstName, lastName, roles }` | `{ message }` |
| POST | `/api/auth/login` | Login a user | `{ username, password }` | `{ token, id, username, email, roles, emailVerified, twoFactorEnabled, twoFactorAuthenticated }` |
| POST | `/api/auth/verify-2fa` | Verify 2FA code | `{ userId, code }` | `{ token, id, username, email, roles, emailVerified, twoFactorEnabled, twoFactorAuthenticated }` |
| POST | `/api/auth/forgot-password` | Request password reset | `{ email }` | `{ message }` |
| POST | `/api/auth/enable-2fa` | Enable 2FA | - | `{ secret, qrCodeUrl }` |
| POST | `/api/auth/disable-2fa` | Disable 2FA | - | `{ message }` |

### Email Verification Endpoints

| Method | Endpoint | Description | Request Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/api/verify?token={token}` | Verify email with token | Query param: `token` | `{ message }` |
| POST | `/api/verify/resend` | Resend verification email | `email` | `{ message }` |

### Password Reset Endpoints

| Method | Endpoint | Description | Request Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| POST | `/api/reset-password` | Reset password with token | `{ token, newPassword }` | `{ message }` |
| GET | `/api/reset-password/validate?token={token}` | Validate reset token | Query param: `token` | `{ message }` |

## User Management

### User Endpoints

| Method | Endpoint | Description | Request Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/api/users/me` | Get current user profile | - | User object |
| PUT | `/api/users/me` | Update current user profile | `{ firstName, lastName, email }` | Updated user object |
| POST | `/api/users/change-password` | Change password | `{ currentPassword, newPassword }` | `{ message }` |
| GET | `/api/users/all` | Get all users (admin only) | - | Array of user objects |
| GET | `/api/users/{id}` | Get user by ID | Path param: `id` | User object |
| PUT | `/api/users/{id}` | Update user (admin only) | `{ firstName, lastName, email, roles }` | Updated user object |
| DELETE | `/api/users/{id}` | Delete user (admin only) | Path param: `id` | `{ message }` |

## Activity Tracking

### Activity Endpoints

| Method | Endpoint | Description | Request Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/api/activities/me` | Get recent activities | - | Array of activity objects |
| GET | `/api/activities/me/all` | Get paginated activities | Query params: `page`, `size` | Paginated activity objects |
| GET | `/api/activities/user/{userId}` | Get user activities (admin or self) | Path param: `userId`, Query params: `page`, `size` | Paginated activity objects |

## Dashboard

### Dashboard Endpoints

| Method | Endpoint | Description | Request Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/api/dashboard/user-stats` | Get user dashboard stats | - | User stats object |
| GET | `/api/dashboard/admin-stats` | Get admin dashboard stats (admin only) | - | Admin stats object |

## Test Endpoints

| Method | Endpoint | Description | Request Body/Params | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/api/test/all` | Public content | - | String message |
| GET | `/api/test/user` | User content | - | String message |
| GET | `/api/test/mod` | Moderator content | - | String message |
| GET | `/api/test/admin` | Admin content | - | String message |

## Error Responses

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error responses include a message field explaining the error:

\`\`\`json
{
  "message": "Error description"
}
\`\`\`

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer < >
\`\`\`

The token is obtained from the login endpoint and should be included in all subsequent requests.

