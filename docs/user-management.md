
# User Management in Supabase

## Authentication System

The application utilizes Supabase's built-in authentication system, which provides secure user management features including:

1. **User Registration and Login**: Managed through the `AuthContext` component (`src/contexts/AuthContext.tsx`), which provides authentication state and methods throughout the application.

2. **Session Management**: Automatically handled by Supabase with token refresh and secure storage.

3. **Password Reset**: Capability provided through Supabase Auth APIs.

## Database Structure

### Tables Related to User Management

1. **auth.users** (Managed by Supabase)
   - Core user table containing authentication information
   - Not directly accessed in application code - accessed through Supabase Auth API

2. **profiles**
   - Contains user profile information
   - Linked to auth.users via user ID
   - Fields: id, first_name, last_name, role, created_at, updated_at, is_active

3. **user_organizations**
   - Maps users to organizations for multi-tenant functionality
   - Fields: id, user_id, organization_id, created_at, updated_at

4. **user_roles**
   - Defines roles for users within each organization
   - Fields: id, user_id, organization_id, role, created_at, updated_at

5. **organizations**
   - Stores organization data
   - Fields: id, name, is_active, created_at, updated_at

6. **organization_summary** (Materialized View)
   - Provides summary statistics for each organization
   - Fields: organization_id, organization_name, total_users, total_items, total_orders, last_order_date

## Row-Level Security (RLS)

Supabase implements Row-Level Security policies that ensure users can only access data they're authorized to see:

1. **Policy-Based Access Control**: 
   - Each table has RLS policies defining read/write permissions
   - Policies use auth.uid() function to identify the current user

2. **Organization-Scoped Access**:
   - Data is scoped to organizations
   - Users can only access data within organizations they belong to

## User Roles and Permissions

The application implements a role-based access control system:

1. **Role Types**:
   - `admin`: Full access to all features and data
   - `user`: Limited access based on role policies

2. **Permission Enforcement**:
   - Frontend: Components conditionally render based on user role
   - Backend: RLS policies enforce data access rules at the database level
   - API Access: Edge functions validate permissions for sensitive operations

## Multi-currency and Multi-language Support

1. **Currency Management**:
   - Support for MAD, EUR, and USD
   - Currency settings stored in user preferences and organization settings
   - All monetary values displayed in the selected currency

2. **Internationalization**:
   - Support for Arabic, French, and English
   - RTL layout for Arabic language
   - Translations managed through the LanguageContext

## Security Features

1. **JWT Authentication**: Supabase uses JWT tokens for secure authentication

2. **Audit Logging**: All sensitive user actions are logged in the `system_audit_logs` table

3. **Foreign Key Constraints**: Proper relations maintained between users and related data

## How Authentication Flow Works

1. User logs in via the login page, triggering `AuthContext.login()`
2. Credentials are sent to Supabase Auth API
3. On successful authentication, Supabase returns a JWT token
4. AuthContext stores the session and updates application state
5. The user is redirected to the dashboard
6. Subsequent API requests include the JWT token for authentication

## Managing Users and Organizations

The User Management page (`/user-management`) provides administrative tools for:

1. **User Management**:
   - Adding new users
   - Toggling user active status
   - Sending password reset emails

2. **Organization Management**:
   - Creating new organizations
   - Assigning users to organizations
   - Viewing organization statistics
   - Toggling organization active status

## Troubleshooting

If users or organizations are not visible in the management interface:

1. Check that the current user has appropriate permissions
2. Verify that the data exists in the database
3. Ensure Row Level Security policies allow access to the data
4. Try refreshing the data using the refresh button
5. Check browser console for any error messages
6. Verify network requests to ensure data is being properly fetched

