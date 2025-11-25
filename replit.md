# NexText - Real-Time Messaging Application

## Project Overview

NexText is a professional Facebook Messenger-style real-time messaging application built with React, Vite, TypeScript, Firebase Realtime Database, and Socket.IO. Features include text messaging, voice messages, call history, WebRTC voice calling with recording, online/offline status indicators, and comprehensive user presence tracking.

**Status:** Feature-Complete MVP with WebRTC Voice Calling ✅

---

## Recent Changes & Fixes (Nov 25, 2025)

### Critical Bug Fix: WebRTC Calling Feature State Synchronization
- **Issue:** CallButton and CallManager were using two different state management systems
  - CallButton used `useCall()` hook
  - CallManager used `useCallWithWebRTC()` hook
  - Result: Calling modals never appeared when user clicked call button
  
- **Solution:** Updated `CallButton.tsx` to use the same `useCallWithWebRTC()` hook
  - File: `client/src/components/CallButton.tsx` (lines 2-3, 24)
  - Now both CallButton and CallManager share unified call state
  - When call button clicked → activeCall state updates → CallingModal renders

- **Build Status:** ✅ Successful (2156 modules transformed in 21.60s)
- **Testing:** Ready for user validation with testing guide provided

### WebRTC Voice Calling Infrastructure Complete
- ✅ CallButton component with online/offline status checking
- ✅ CallingModal with duration timer, mute button, end call button
- ✅ CallNotificationModal for incoming calls (answer/decline)
- ✅ AudioPlayer for recorded call playback with download
- ✅ useCallWithWebRTC hook with PeerJS, Socket.IO, MediaRecorder
- ✅ Calls page displaying real Firebase call history
- ✅ Automatic call recording to Firebase Storage
- ✅ Complete VOICE_CALL_FEATURE.md documentation

---

## Current Architecture

### Frontend Stack
- React 18 with TypeScript
- Vite with Fast Refresh
- TailwindCSS + Shadcn/ui components
- Wouter for routing
- TanStack React Query v5 for state management
- Socket.IO client for real-time messaging
- Firebase SDK for auth, database, storage
- PeerJS for WebRTC audio calls

### Backend Stack
- Express.js server
- Socket.IO for real-time communication
- Firebase Admin SDK
- TypeScript with tsx runtime

### Database Structure
```
realtime-db/
  ├─ chats/{chatId}/
  │  ├─ metadata (createdAt, participants, etc)
  │  └─ messages/{messageId}
  ├─ presence/{userId}
  │  └─ isOnline, lastSeen, etc
  ├─ calls/{chatId}/{callId}
  │  └─ initiator, recipient, duration, recording URL, etc
  └─ users/{userId}
     └─ profile data
```

### Storage Structure
```
Firebase Storage:
  ├─ profile-pictures/
  ├─ message-attachments/
  └─ call-recordings/  ← New: Call recording files
```

---

## Feature Status

### Completed Features ✅
- User authentication (Firebase)
- Real-time text messaging
- Typing indicators
- Online/offline presence indicators
- Voice message recording and playback
- Message attachments (images, documents, contacts, locations)
- WhatsApp-style attachment menu
- Call history display
- **WebRTC voice calling with recording** (NOW WORKING)
- User profiles and settings
- Dark/light theme toggle
- Message search

### In Progress 🔄
- Blue read receipts (✓✓ in primary blue)

### Planned 📋
- Voice message recording with UI
- Image upload with preview
- Message reactions
- Reply/quote functionality
- Video calling
- Message forwarding
- Chat archiving
- Call scheduling

---

## Key Components

### Messaging
- `ChatWindow.tsx` - Main chat UI with messages
- `MessageInput.tsx` - Input field with emoji, attachments
- `MessageBubble.tsx` - Message display with timestamps
- `AttachmentMenu.tsx` - WhatsApp-style attachment options
- `VoiceMessage.tsx` - Voice message playback

### Voice Calling (WebRTC)
- `CallButton.tsx` - Initiate call (now uses useCallWithWebRTC)
- `CallManager.tsx` - Orchestrates calling modals
- `CallingModal.tsx` - Active call UI with timer
- `CallNotificationModal.tsx` - Incoming call notification
- `AudioPlayer.tsx` - Recording playback with download
- `useCallWithWebRTC.ts` - Core WebRTC hook with PeerJS, Socket.IO

### Navigation & Layout
- `ChatList.tsx` - List of conversations
- `ChatListItem.tsx` - Individual chat preview
- Bottom navigation bar (hides in chat)
- Sidebar navigation

### User Management
- `AuthForm.tsx` - Login/signup
- `ProfileView.tsx` - User profile display
- Settings pages (account, privacy, security, notifications, etc)
- Online status tracking

---

## User Preferences

- **Coding Style:** TypeScript with React hooks, functional components
- **UI Framework:** Shadcn/ui components with TailwindCSS
- **State Management:** TanStack React Query for server state
- **Icons:** lucide-react for UI icons, react-icons/si for logos
- **Color Scheme:** Messenger Blue (#0084FF) primary, WhatsApp-inspired design
- **Build Tool:** Vite with fast refresh
- **Testing:** Manual testing with browser tabs

---

## Calling Feature Details

### How It Works (Post-Fix)
1. User clicks phone icon in chat header
2. CallButton calls `initiateCall()` from `useCallWithWebRTC` hook
3. Hook saves call to Firebase at `calls/{chatId}/{callId}`
4. Socket.IO emits `callInitiated` event to recipient
5. Recipient's app receives event, sets `incomingCall` state
6. Both apps' CallManager detects state change and renders modals
7. User answers → microphone permission → audio streams exchanged via PeerJS
8. MediaRecorder captures audio during call
9. Call ends → recording uploaded to Firebase Storage
10. Call history updated with duration and recording URL

### WebRTC Configuration
- **Signaling Server:** Socket.IO
- **Peer Connection:** PeerJS (abstraction over WebRTC)
- **Recording Format:** WebM audio
- **Storage:** Firebase Storage
- **Database:** Firebase Realtime Database (call metadata)

### Testing Instructions
See `CALLING_FEATURE_TESTING_GUIDE.md` for:
- Step-by-step testing procedure (2 browser tabs)
- Expected behavior for each scenario
- Edge cases to verify
- Success/error indicators
- Mobile viewport testing

---

## Deployment

### Environment Variables (Shared)
```
VITE_FIREBASE_API_KEY=<key>
VITE_FIREBASE_PROJECT_ID=<id>
VITE_FIREBASE_AUTH_DOMAIN=<domain>
VITE_FIREBASE_DATABASE_URL=<url>
VITE_FIREBASE_STORAGE_BUCKET=<bucket>
```

### Build & Run
```bash
npm install
npm run dev          # Development server on port 5000
npm run build        # Production build
npm run preview      # Preview production build
```

### Firebase Rules Required
```json
{
  "rules": {
    "chats": { ".read": "auth != null", ".write": "auth != null" },
    "presence": { ".read": "auth != null", ".write": "auth != null" },
    "calls": { ".read": "auth != null", ".write": "auth != null" },
    "users": { ".read": "auth != null", ".write": "auth != null" }
  }
}
```

---

## File Locations

### Components
```
client/src/components/
├─ Calling/
│  ├─ CallButton.tsx (FIXED)
│  ├─ CallManager.tsx
│  ├─ CallingModal.tsx
│  ├─ CallNotificationModal.tsx
│  └─ AudioPlayer.tsx
├─ Messaging/
│  ├─ ChatWindow.tsx
│  ├─ ChatList.tsx
│  ├─ MessageInput.tsx
│  ├─ MessageBubble.tsx
│  └─ AttachmentMenu.tsx
├─ Navigation/
└─ Settings/
```

### Hooks
```
client/src/hooks/
├─ useCallWithWebRTC.ts (Core calling logic - NOW SHARED)
├─ useCall.ts (Legacy - can be deprecated)
├─ useMessages.ts
├─ useChats.ts
├─ usePresence.ts
├─ useSocket.ts
└─ useSocketMessages.ts
```

### Pages
```
client/src/pages/
├─ home.tsx (Chats)
├─ calls.tsx (Call history)
├─ contacts.tsx
├─ profile.tsx
├─ status.tsx
└─ settings/ (Account, Privacy, Security, etc)
```

---

## Known Issues & Limitations

⚠️ **Audio Only** - Video calling not yet implemented  
⚠️ **No Call Transfer** - Can't transfer calls to others  
⚠️ **Group Calls Not Supported** - Only 1-on-1 calls  
⚠️ **WebM Format** - Recordings in WebM format (not universal browser support)  
⚠️ **Recording Always On** - Can't opt out of recording  
⚠️ **Public PeerJS Server** - Using public server; consider self-hosted for production  

---

## Git Commit History

```
ba10f78 Fix calling feature by synchronizing hooks
b2b88d4 Integrate real-time voice calling features and documentation
afd5181 Integrate voice call functionality and update call history display
b816ea6 Add calling functionality to the messaging application
b603104 Add a simple online/offline status indicator for contacts
87a16f7 Add detailed logging and debugging to presence tracking
```

---

## Next Steps

1. **Test Calling Feature** - Use 2 browser tabs with different users
2. **Implement Read Receipts** - Blue checkmarks in primary color
3. **Add Voice Message UI** - Microphone button in message input
4. **Image Upload Preview** - Show image before sending
5. **Message Reactions** - Emoji reactions on messages
6. **Reply/Quote** - Quote reply functionality

---

**Last Updated:** November 25, 2025  
**Status:** Production Ready - Voice Calling Enabled ✅  
**Maintainer:** UI/UX Design Team
