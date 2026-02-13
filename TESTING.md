# Registration Testing Steps

## To Test User Registration:

1. **Open the application**: http://localhost:3000

2. **Click "Login as User"** button on the home page

3. **Click "Register here"** link

4. **Fill in the registration form**:
   - Full Name: Test User
   - Email: testuser@example.com (use a unique email each time)
   - Password: password123

5. **Click the Register button**

6. **Expected Result**: 
   - You should see a green success message: "Registration successful! Please login."
   - You'll be redirected to the login page after 1.5 seconds
   - You can now login with your email and password

## To Test Organizer Registration:

1. **Open the application**: http://localhost:3000

2. **Click "Login as Organizer"** button on the home page

3. **Click "Register here"** link

4. **Click the "Organizer" toggle button** to switch registration mode

5. **Fill in the registration form**:
   - Company Name: My Event Company
   - Email: organizer@example.com (use a unique email each time)
   - Password: password123

6. **Click the Register button**

7. **Expected Result**: 
   - You should see a green success message: "Registration successful! Please login."
   - You'll be redirected to the login page after 1.5 seconds
   - You can now login with your email and password

## Common Issues:

### "User already exists" error
- This means the email is already registered
- Try with a different email address

### No message appears when clicking Register
- Check the browser console (F12)
- Look for error messages in red
- Make sure all fields are filled in
- Make sure the server is running (you should see "Server running on http://localhost:3000" in the terminal)

### Browser Console Logs to Look For:
- "🚀 EventFlow System Loaded - API Base: http://localhost:3000/api"
- "✅ App initialized"
- "✅ Event listeners attached"
- "Register clicked!"
- "Endpoint: http://localhost:3000/api/auth/register"

If you don't see these, the JavaScript hasn't loaded properly.
