# User Roles and Permissions

This document outlines the role-based access control (RBAC) system implemented in the Web Application Project.

## Available Roles

The application supports the following user roles:

1. **User** (`ROLE_USER`)
   - Basic role assigned to all registered users
   - Access to personal dashboard and profile management

2. **Moderator** (`ROLE_MODERATOR`)
   - Intermediate role with additional permissions
   - Can access moderator-specific features

3. **Admin** (`ROLE_ADMIN`)
   - Highest level of access
   - Full system administration capabilities

## Permission Matrix

The following table outlines the permissions for each role:

| Feature/Action | User | Moderator | Admin |
|----------------|------|-----------|-------|
| **Authentication** |
| Login/Logout | ✅ | ✅ | ✅ |
| Register | ✅ | ✅ | ✅ |
| Reset Password | ✅ | ✅ | ✅ |
| Enable/Disable 2FA | ✅ | ✅ | ✅ |
| **Profile Management** |
| View Own Profile | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ |
| **Activity** |
| View Own Activity | ✅ | ✅ | ✅ |
| **Dashboard** |
| Access User Dashboard | ✅ | ✅ | ✅ |
| Access Admin Dashboard | ❌ | ❌ | ✅ |
| **User Management** |
| View All Users | ❌ | ❌ | ✅ |
| Create Users | ❌ | ❌ | ✅ |
| Edit Users | ❌ | ❌ | ✅ |
| Delete Users | ❌ | ❌ | ✅ |
| **System Settings** |
| View System Settings | ❌ | ❌ | ✅ |
| Edit System Settings | ❌ | ❌ | ✅ |

## Implementation Details

### Role Assignment

Roles are assigned during user registration or can be modified by administrators. By default, new users are assigned the `ROLE_USER` role.

```java
// Default role assignment during registration
if (strRoles == null) {
    Role userRole = roleRepository.findByName(Role.ERole.ROLE_USER)
            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
    roles.add(userRole);
}
