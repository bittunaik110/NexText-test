
# NexText PIN Connection System

## Overview
The PIN system allows users to connect with each other by sharing a unique 6-character alphanumeric code.

## PIN Format
- **Length:** 6 characters
- **Character set:** A-Z (uppercase) and 0-9
- **Example:** `A1B2C3`, `XYZ789`

## Backend Implementation

### Database Schema (Firestore)

#### Users Collection
```
/users/{userId}
  - pin: string (6 chars, unique, uppercase alphanumeric)
  - displayName: string
  - email: string
  - photoURL: string
  - bio: string
  - createdAt: ISO timestamp
```

#### User Contacts Subcollection
```
/users/{userId}/contacts/{contactId}
  - userId: string (the contact's ID)
  - displayName: string
  - photoURL: string
  - bio: string
  - addedAt: ISO timestamp
```

### PIN Generation
**File:** `server/utils/pin-generator.ts`

Functions:
- `generatePIN()`: Generates a random 6-character alphanumeric PIN
- `generateUniquePIN(checkExists)`: Ensures global uniqueness by checking against existing PINs

### API Endpoints

#### Generate/Get User PIN
Automatic generation happens on:
1. Profile creation: `POST /api/users/profile`
2. Profile fetch (if missing): `GET /api/users/profile`

#### Find User by PIN
```
GET /api/users/by-pin/:pin
Response: { user: { id, displayName, photoURL, bio } }
```

#### Add Contact by PIN
```
POST /api/users/contacts/add-by-pin
Body: { pin: "ABC123" }
Response: { success: true, contact: {...} }
```

**Behavior:**
- Validates PIN format (6 chars)
- Searches for user with matching PIN
- Prevents self-addition
- Prevents duplicate contacts
- Creates bidirectional contact relationship

## Frontend Implementation

### Components

#### PinInput (`client/src/components/PinInput.tsx`)
- 6 individual input boxes
- Auto-focus next on input
- Paste support
- Uppercase conversion

#### ConnectModal (`client/src/components/ConnectModal.tsx`)
- PIN entry interface
- Backend validation
- Error handling
- Loading states
- Success notifications

#### ProfileView (`client/src/components/ProfileView.tsx`)
- Displays user's own PIN
- Copy to clipboard functionality

### User Flow

1. **Share PIN:**
   - User views their PIN in Profile
   - Clicks copy button to copy PIN
   - Shares PIN via any communication method

2. **Add Contact:**
   - User clicks "New Chat" or "Add Contact"
   - Opens ConnectModal
   - Enters friend's 6-character PIN
   - System validates and adds contact
   - Both users now have each other as contacts

3. **Error Handling:**
   - Invalid format: "Please enter a 6-character PIN"
   - Not found: "User not found or already added"
   - Self-add attempt: "You cannot add yourself as a contact"
   - Already added: "Contact already added"

## Security Considerations

1. **Uniqueness:** PINs are globally unique across all users
2. **Generation:** Uses cryptographically secure random generation
3. **Collision prevention:** Retries generation if collision detected (max 10 attempts)
4. **Authentication:** All PIN-related API endpoints require Firebase Auth token
5. **Bidirectional:** Contact relationships are symmetric (both users have each other)

## Testing Checklist

- [ ] New user receives unique PIN on signup
- [ ] PIN displays correctly in profile
- [ ] Copy PIN to clipboard works
- [ ] Valid PIN adds contact successfully
- [ ] Invalid PIN shows error message
- [ ] Cannot add self as contact
- [ ] Cannot add duplicate contact
- [ ] Both users appear in each other's contact lists
- [ ] PIN persists across sessions
- [ ] PIN is immutable (never changes)
