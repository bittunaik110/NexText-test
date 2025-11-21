
# NexText Backend Schema Documentation

## Firebase Realtime Database Structure

### Chats Collection
**Path:** `/chats/{chatId}`

```json
{
  "chatId": {
    "participants": ["userId1", "userId2"],
    "createdAt": "ISO timestamp",
    "lastMessage": "Last message text",
    "lastMessageTime": "ISO timestamp",
    "unreadCount": {
      "userId1": 0,
      "userId2": 2
    },
    "deleted": false,
    "participantNames": {
      "userId1": "User Name 1",
      "userId2": "User Name 2"
    },
    "participantPhotos": {
      "userId1": "photoURL1",
      "userId2": "photoURL2"
    }
  }
}
```

### Messages Collection
**Path:** `/messages/{chatId}/{messageId}`

```json
{
  "messageId": {
    "id": "messageId",
    "text": "Message text",
    "timestamp": 1234567890,
    "userId": "senderId",
    "deleted": false,
    "mediaUrl": "optional media URL",
    "gifUrl": "optional GIF URL",
    "replyTo": "optional messageId",
    "reactions": {
      "userId": "emoji"
    },
    "edited": false,
    "editedAt": 1234567890,
    "status": "sent|delivered|read",
    "readBy": ["userId1", "userId2"]
  }
}
```

### Users Collection (Firestore)
**Path:** `/users/{userId}`

```json
{
  "email": "user@example.com",
  "displayName": "User Name",
  "bio": "User bio",
  "photoURL": "photo URL",
  "pin": "unique PIN",
  "createdAt": "ISO timestamp",
  "fcmTokens": [
    {
      "token": "FCM token",
      "platform": "web|ios|android",
      "registeredAt": "ISO timestamp"
    }
  ],
  "notificationPreferences": {
    "enablePush": true,
    "enableInApp": true,
    "enableEmail": false,
    "muteUntil": "",
    "mutedChats": ["chatId1"]
  }
}
```

### Presence Collection
**Path:** `/presence/{userId}`

```json
{
  "isOnline": true,
  "lastSeen": 1234567890
}
```

### Typing Indicators
**Path:** `/typing/{chatId}/{userId}`

```json
{
  "isTyping": true,
  "timestamp": 1234567890
}
```

## REST API Endpoints

### Authentication
All API requests require Firebase Authentication token in header:
```
Authorization: Bearer <firebase-id-token>
```

### Users API (`/api/users`)

#### POST `/api/users/profile`
Create user profile
```json
Request: {
  "displayName": "User Name",
  "bio": "Optional bio",
  "photoURL": "Optional photo URL"
}
Response: {
  "success": true,
  "user": { /* user data */ }
}
```

#### GET `/api/users/profile`
Get current user profile

#### PUT `/api/users/profile`
Update user profile

#### GET `/api/users/by-pin/:pin`
Find user by PIN code

### Chats API (`/api/chats`)

#### POST `/api/chats/create`
Create or get existing chat
```json
Request: {
  "participantId": "userId"
}
Response: {
  "chatId": "chatId",
  "chat": { /* chat data */ }
}
```

#### GET `/api/chats/list`
Get all chats for current user

#### GET `/api/chats/:chatId`
Get specific chat details

#### PUT `/api/chats/:chatId/read`
Mark chat as read (reset unread count)

### Messages API (`/api/messages`)

#### GET `/api/messages/:chatId/messages`
Get messages for a chat
Query params:
- `limit` (default: 50)
- `before` (timestamp for pagination)

#### GET `/api/messages/:chatId/search`
Search messages in a chat
Query params:
- `query` (search text)
- `startDate` (timestamp)
- `endDate` (timestamp)

### Upload API (`/api/upload`)

#### POST `/api/upload/image`
Upload image file
- Content-Type: multipart/form-data
- Field name: `file`

## Socket.io Events

### Client to Server

- `join-chat` - Join a chat room
  ```json
  { "chatId": "chatId" }
  ```

- `leave-chat` - Leave a chat room
  ```json
  { "chatId": "chatId" }
  ```

- `send-message` - Send a new message
  ```json
  {
    "chatId": "chatId",
    "messageData": {
      "text": "message text",
      "mediaUrl": "optional",
      "gifUrl": "optional",
      "replyTo": "optional messageId"
    }
  }
  ```

- `typing-start` - User started typing
  ```json
  { "chatId": "chatId" }
  ```

- `typing-stop` - User stopped typing
  ```json
  { "chatId": "chatId" }
  ```

- `react-to-message` - Add reaction to message
  ```json
  {
    "chatId": "chatId",
    "messageId": "messageId",
    "emoji": "👍"
  }
  ```

- `edit-message` - Edit a message
  ```json
  {
    "chatId": "chatId",
    "messageId": "messageId",
    "newText": "edited text"
  }
  ```

- `delete-message` - Delete a message
  ```json
  {
    "chatId": "chatId",
    "messageId": "messageId"
  }
  ```

### Server to Client

- `new-message` - New message received
- `message-edited` - Message was edited
- `message-deleted` - Message was deleted
- `message-reaction` - Reaction added to message
- `message-status-update` - Message status changed
- `user-typing` - User typing status changed
- `message-error` - Error sending message

## Data Flow

### Sending a Message
1. User types message in MessageInput component
2. Component calls `sendMessage()` from useSocketMessages hook
3. Hook emits `send-message` Socket.io event
4. Server receives event, validates, and saves to Firebase Realtime Database
5. Server broadcasts `new-message` to all users in the chat
6. All clients receive message via real-time listener (useMessages hook)
7. UI updates automatically

### Loading Chats
1. Component mounts with useChats hook
2. Hook sets up Firebase Realtime Database listener on `/chats`
3. Firebase returns all chats where user is a participant
4. Chats are filtered (non-deleted) and sorted by last message time
5. State updates trigger re-render with chat list

### Authentication Flow
1. User logs in via Firebase Auth
2. ID token is obtained via `getIdToken()`
3. Token is included in all API requests and Socket.io connection
4. Server validates token for each request
5. User ID is extracted and used for authorization

## Error Handling

All hooks implement:
- Try-catch blocks for error capture
- Toast notifications for user feedback
- Loading states during async operations
- Error states for failed operations
- Automatic reconnection for Socket.io

## Security Rules

Firebase Realtime Database rules should ensure:
- Users can only read/write their own data
- Users can only access chats they're participants in
- Messages can only be edited/deleted by the sender
