# Debugging Guide for 401 Login Error

## Issue
Getting 401 Unauthorized errors when trying to log in through the Coursera-style auth flow.

## Possible Causes

### 1. **Wrong Password**
The most common cause - make sure you're using the correct password for the test account.

### 2. **No Test User Exists**
You may not have a user account with the email you're testing.

## Solutions

### Option 1: Create a Test User via Django Admin

1. Navigate to: `http://localhost:8000/admin`
2. Login with admin credentials (or create admin first)
3. Create a new user with:
   - Email: test@example.com
   - Password: Test@1234
   - Role: student

### Option 2: Create Admin User via Command Line

```bash
cd backend
py manage.py createsuperuser
# Follow prompts to create admin user
```

### Option 3: Test with New User Flow

Instead of testing existing user login, test the NEW USER flow:

1. Go to `http://localhost:3001/auth`
2. Enter a NEW email (one that doesn't exist): `newuser@test.com`
3. Check your backend terminal for the 6-digit verification code
4. Enter the code
5. Complete signup with name and password
6. This will create a new account and log you in

### Option 4: Check Browser Console

Open browser DevTools (F12) and check:
- Console tab for detailed error messages
- Network tab to see the actual request/response

The error message should now show in the console with more details.

## Testing Steps

1. **Test New User Signup** (Recommended first):
   ```
   Email: test123@example.com
   → Check terminal for code
   → Enter code
   → Name: Test User
   → Password: Test@1234
   → Should create account and log in
   ```

2. **Test Existing User Login**:
   ```
   Email: (use the email you just created)
   Password: Test@1234
   → Should log in successfully
   ```

## Verification

After login succeeds, you should:
- See tokens in localStorage
- Be redirected to dashboard based on role
- See user info in the header

## Common Mistakes

❌ Using wrong email format
❌ Using wrong password
❌ Testing with non-existent user
❌ Not checking terminal for verification code

✅ Start with new user signup
✅ Check browser console for errors
✅ Check backend terminal for verification codes
✅ Use strong password (8+ characters)
