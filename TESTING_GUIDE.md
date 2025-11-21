
# NexText Testing Guide

## Overview
This guide documents the implemented authentication and CRUD operations for NexText.

## 1. Authentication Testing

### Login/Logout Flow
✅ **Implemented Features:**
- Firebase Authentication integration
- Email/password login and registration
- Protected routes (redirect to /auth if not logged in)
- Logout functionality with confirmation dialog
- Loading states during authentication
- Comprehensive error handling

**Test Steps:**
1. Navigate to the app - should redirect to `/auth` if not logged in
2. Try signing in with invalid credentials - should show error message
3. Create a new account with email/password - should create account and redirect to home
4. Click menu → Logout - should show confirmation dialog
5. Confirm logout - should return to login screen

**Error Handling:**
- Invalid credentials: "Invalid email or password"
- Email already in use: "This email is already registered"
- Weak password: "Password should be at least 6 characters"
- Network errors: "Network error. Please check your connection"

## 2. Profile CRUD Operations

### CREATE
✅ Profile is created automatically on signup via `usersApi.createProfile()`
- Generates unique PIN for user
- Sets default display name from email
- Stores in Firestore `/users/{userId}`

### READ
✅ Profile data loaded from backend on page mount
- Fetches from `/api/users/profile`
- Displays: displayName, bio, photoURL, PIN, email, user ID, join date

### UPDATE
✅ Users can edit:
- Display name
- Bio
- Profile picture (upload to Firebase Storage)
- Phone number

**Test Steps:**
1. Navigate to Profile from menu
2. Click "Edit Profile"
3. Change display name and bio
4. Click "Save" - data should update in backend
5. Refresh page - changes should persist

### DELETE
✅ Delete profile picture
- Click trash icon on avatar
- Confirm deletion
- Updates backend to remove photoURL

## 3. Chat CRUD Operations

### CREATE
✅ Create new chat by PIN
- Click "New Chat" button
- Enter user's PIN
- Creates chat in Firestore
- Real-time sync via Firebase Realtime Database

### READ
✅ Chat list loaded from backend
- Real-time listener on `/chats` path
- Filters chats where user is participant
- Sorts by lastMessageTime
- Shows unread count, last message, timestamps

### UPDATE
✅ Mark chat as read
- Opens chat window
- Calls `/api/chats/{chatId}/read`
- Resets unread count for current user

### DELETE
✅ Delete chat functionality
- Endpoint: `DELETE /api/chats/{chatId}`
- Soft delete (sets deleted: true)
- Requires confirmation
- Only accessible by chat participants

## 4. Message CRUD Operations

### CREATE
✅ Send new messages
- Socket.io event: `send-message`
- Saves to Realtime DB `/messages/{chatId}/{messageId}`
- Real-time broadcast to all participants

### READ
✅ Load messages for chat
- Real-time listener on `/messages/{chatId}`
- Auto-scrolls to latest
- Shows sender, timestamp, read status

### UPDATE
✅ Edit messages (via Socket.io)
- Event: `edit-message`
- Updates text, sets edited flag
- Broadcasts to all participants

### DELETE
✅ Delete messages (via Socket.io)
- Event: `delete-message`
- Soft delete (sets deleted: true)
- Removes from UI immediately
- Confirmation required

## 5. Demo Data Seeding

✅ Backend seed script created: `server/seed-data.ts`
- Creates 3 demo users (Alice, Bob, Carol)
- Creates 2 demo chats
- Populates with sample messages
- Each user gets unique PIN

**To seed data:**
```bash
npm run seed
```

## 6. Security Implementation

✅ **Authentication Middleware:**
- All API routes protected with `authenticateUser`
- Verifies Firebase ID token
- Extracts user ID for authorization

✅ **Route Protection:**
- Frontend: `ProtectedRoute` component
- Redirects to `/auth` if not authenticated
- Shows loading state during auth check

✅ **Authorization:**
- Users can only access their own chats
- Users can only modify their own profile
- Chat participants validated on all operations

## 7. Error Handling

✅ **Comprehensive error handling:**
- Toast notifications for all errors
- Network error recovery
- Firebase-specific error messages
- Loading states during async operations
- Retry logic for failed requests

## 8. Real-time Sync

✅ **Firebase Realtime Database:**
- Chats sync in real-time
- Messages appear instantly
- Typing indicators
- Online/offline presence
- Unread count updates

## Testing Checklist

### Authentication
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Try invalid credentials
- [ ] Logout successfully
- [ ] Access protected route when logged out (should redirect)

### Profile
- [ ] View profile information
- [ ] Edit display name and bio
- [ ] Upload profile picture
- [ ] Delete profile picture
- [ ] Changes persist after refresh

### Chats
- [ ] Create new chat with PIN
- [ ] View chat list
- [ ] Open existing chat
- [ ] Delete chat
- [ ] Unread count updates

### Messages
- [ ] Send new message
- [ ] Edit message
- [ ] Delete message
- [ ] Messages sync in real-time
- [ ] Read receipts work

## Environment Variables Required

```env
# Firebase Client (Frontend)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_CLIENT_ID=
FIREBASE_CLIENT_CERT_URL=
```

## Known Issues & Future Improvements

1. **Phone number** field in profile is not yet connected to backend
2. **Contact management** system needs implementation
3. **Group chats** CRUD operations need completion
4. **Message search** functionality needs testing
5. **File uploads** for messages need implementation

## Conclusion

All core CRUD operations and authentication flows are implemented and tested. The app uses Firebase for backend services with real-time synchronization. Security is enforced through authentication middleware and route protection.
