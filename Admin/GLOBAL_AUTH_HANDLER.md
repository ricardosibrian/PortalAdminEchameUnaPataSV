# Global 401 Error Handling Implementation

## Overview
This document describes the implementation of centralized authentication error handling for the Portal Admin application. When the backend returns a **401 Unauthorized** response (indicating an expired or invalid token), the application automatically redirects users to the login page and clears all session data.

---

## Implementation Details

### 1. **Centralized API Client** (`src/utils/apiClient.js`)

A new API client module has been created that wraps the native `fetch` API with the following features:

#### Key Functions:

- **`apiFetch(url, options)`** - Main wrapper that:
  - Automatically adds the `Authorization: Bearer <token>` header to all requests
  - Handles `FormData` properly (removes Content-Type header to allow browser to set it with boundary)
  - Detects **401 Unauthorized** responses
  - Triggers session cleanup and redirect on 401 errors
  - Prevents redirect loops on the login page

- **`clearAuthData()`** - Clears all authentication data from localStorage:
  - Removes `TOKEN_APP`
  - Can be extended to clear other auth-related data

- **Convenience Methods**:
  - `apiGet(url, options)` - GET requests
  - `apiPost(url, body, options)` - POST requests with JSON body
  - `apiPut(url, body, options)` - PUT requests with JSON body
  - `apiDelete(url, options)` - DELETE requests
  - `apiPatch(url, body, options)` - PATCH requests with JSON body

#### 401 Handling Flow:

```javascript
1. API request returns 401
2. Check if current page is /login (prevent loop)
3. If not on login page:
   a. Call clearAuthData() to remove TOKEN_APP
   b. Redirect to /login via window.location.href
4. Throw error to stop further processing
```

---

### 2. **Updated Files**

All API calls throughout the application have been updated to use the new `apiClient`:

#### Service Layer:
- **`src/service/Adoptions.js`**
  - `GetApplicationById()` - Now uses `apiGet()`
  - `UpdateApplicationStatus()` - Now uses `apiPut()`

#### Pages:
- **`src/pages/SolicitudesAdopcion.jsx`**
  - `fetchApplications()` - Now uses `apiGet()`

- **`src/pages/Denuncias.jsx`**
  - `fetchReports()` - Now uses `apiGet()`
  - `handleCloseReports()` - Now uses `apiPatch()`
  - `handleVerDenuncia()` - Now uses `apiGet()`

- **`src/pages/GestionPerros.jsx`**
  - `fetchPerros()` - Now uses `apiFetch()`
  - `handleVerDetalle()` - Now uses `apiFetch()`
  - `handleUpdate()` - Now uses `apiFetch()` (FormData support)
  - `handleSubmit()` - Now uses `apiFetch()` (FormData support)

- **`src/pages/GestionPadrinos.jsx`**
  - `fetchSponsorships()` - Now uses `apiGet()`
  - `handleVerDetalle()` - Now uses `apiGet()`
  - `handleCreateSubmit()` - Now uses `apiPost()`
  - `handleSubmitRenovacion()` - Now uses `apiPut()`

- **`src/pages/Login.jsx`**
  - Updated to call `clearAuthData()` on component mount
  - Ensures clean state when user reaches login page

#### Components:
- **`src/components/NuevoPadrino.jsx`**
  - `fetchAnimals()` - Now uses `apiGet()`

---

### 3. **How It Works in Practice**

#### Scenario 1: Token Expires During Normal Operation
```
User is on /gestion-perros
↓
User clicks to fetch animals
↓
Backend returns 401 (token expired)
↓
apiClient detects 401
↓
Clears TOKEN_APP from localStorage
↓
Redirects to /login
↓
User sees login page with clean state
```

#### Scenario 2: User Manually Navigates to Login
```
User navigates to /login
↓
Login component mounts
↓
useEffect calls clearAuthData()
↓
Any existing token is removed
↓
User starts with fresh session
```

#### Scenario 3: Login Endpoint Returns 401 (Wrong Credentials)
```
User enters wrong credentials
↓
Login endpoint returns 401
↓
apiClient detects current page is /login
↓
Does NOT redirect (prevents loop)
↓
Error is handled locally by Login component
↓
User sees error message
```

---

### 4. **Benefits**

✅ **Global Scope**: Every API request in the app is protected  
✅ **DRY Principle**: No need to repeat auth logic in every component  
✅ **Automatic Token Injection**: Bearer token added automatically  
✅ **Loop Prevention**: Smart detection prevents infinite redirects  
✅ **Clean Sessions**: All auth data cleared before redirect  
✅ **FormData Support**: Handles multipart uploads correctly  
✅ **Maintainable**: Single point of change for auth logic  

---

### 5. **Testing the Implementation**

#### Manual Testing Steps:

1. **Normal Flow Test**:
   - Login with valid credentials
   - Navigate through different pages
   - Verify all API calls work correctly

2. **Token Expiration Test**:
   - Login successfully
   - Manually expire the token in the backend or localStorage
   - Try to fetch data from any page
   - Verify automatic redirect to /login
   - Verify localStorage is cleared

3. **Wrong Credentials Test**:
   - Navigate to /login
   - Enter wrong credentials
   - Verify error message appears
   - Verify NO redirect loop occurs

4. **Direct Login Access Test**:
   - Login successfully
   - Navigate to /login directly
   - Verify old token is cleared
   - Verify you can login again

#### Simulating Token Expiration (for testing):

```javascript
// In browser console, set an invalid token:
localStorage.setItem('TOKEN_APP', 'invalid_token_xyz');

// Then try to navigate or fetch data
// Should automatically redirect to /login
```

---

### 6. **Configuration**

The API base URL is still configured in `src/config.js`:

```javascript
export const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;
```

The token is stored in localStorage with the key:
```javascript
TOKEN_APP
```

---

### 7. **Future Enhancements**

Potential improvements that could be added:

1. **Token Refresh**: Implement automatic token refresh before expiration
2. **Request Queue**: Queue failed requests and retry after re-authentication
3. **User Notification**: Show a toast/notification when session expires
4. **Redirect State**: Remember the page user was on and redirect back after login
5. **Multiple Storage Keys**: Clear additional user data if needed

---

### 8. **Troubleshooting**

#### Issue: Still getting 401 errors after login
**Solution**: Check that the token is being saved correctly in localStorage after successful login.

#### Issue: Redirect loop on login page
**Solution**: Verify the `isLoginPage()` check in apiClient.js is working correctly.

#### Issue: Token not being sent with requests
**Solution**: Ensure localStorage key is exactly `TOKEN_APP` (case-sensitive).

#### Issue: FormData uploads failing
**Solution**: Verify `Content-Type` header is not being set for FormData requests.

---

## Summary

The global 401 error handling is now fully implemented and operational. All API requests throughout the application are protected, and users will be automatically redirected to the login page with a clean session when their authentication token expires or becomes invalid.

