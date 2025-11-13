
### 3. Delete Account

```typescript
export interface DeleteAccountRequest {
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

deleteAccount(data: DeleteAccountRequest): Observable<DeleteAccountResponse> {
  return this.http
    .post<DeleteAccountResponse>(`${this.API_URL}/delete-account`, data)
    .pipe(catchError(this.handleError));
}
```

**API Endpoint**: `POST http://localhost:3200/api/auth/delete-account`

**Request Body**:
```json
{
  "password": "currentPassword123"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Implementation Steps

1. **Add the interfaces** to `auth.service.ts` (above the `@Injectable` decorator)

2. **Add the methods** to the `AuthService` class

3. **Uncomment the service calls** in `profile.ts`:
   - In `onUpdateProfile()` method (line ~117)
   - In `onChangePassword()` method (line ~149)
   - In `onDeleteAccount()` method (line ~190)

4. **Remove the temporary simulations** (setTimeout blocks) after implementing the real services

---

## Current Profile Component Features

✅ **Profile Tab**:
- Edit name, email, phone, and address
- Form validation
- Update profile information

✅ **Security Tab**:
- Change password functionality
- Current password verification
- New password confirmation
- Password strength validation

✅ **Danger Zone Tab**:
- Delete account with confirmation modal
- Password verification required
- User must type "DELETE" to confirm
- Permanent action warning

✅ **Additional Features**:
- User avatar display
- Member since date
- Logout functionality
- Success/error message alerts
- Loading states on all buttons
- Responsive design
- Tab navigation
- Beautiful UI with animations

---

## Notes

- All service methods use the existing `handleError` method for error handling
- The component automatically updates local storage after successful profile update
- After account deletion, the user is logged out and redirected to home
- All forms have proper validation and error messages
- The component uses Angular signals for reactive state management
