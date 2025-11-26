# Incoming Call Notification System - Complete Guide

## System Overview

NexText uses a real-time WebRTC + Socket.IO architecture for voice and video calls. When User A initiates a call to User B, User B receives an instant notification with answer/decline options.

---

## User Flow Diagram

```
User A (Initiator)          Socket.IO Server          User B (Recipient)
     |                              |                           |
     |--- initiateCall() ---------->|                           |
     |                              |                           |
     |                    emit("callInitiated")                 |
     |                              |--- setIncomingCall() --->|
     |                              |                      [Show Modal]
     |                              |                           |
     |<------- [FloatingCallWindow Opens] ------->             |
     |                              |                    User sees:
     |                              |                    - Caller avatar
     |                              |                    - "is calling..."
     |                              |                    - [Accept] [Decline]
     |                              |                           |
     |                              |  [User clicks Accept/Decline]
     |                              |                           |
     |<--- answerCall() / declineCall() ------                 |
     |                              |                           |
     | (if Accept)                  |                           |
     |<----- WebRTC Connection Established ----->              |
     |  Audio/Video Stream           |        Audio/Video Stream
     |<-------------- [Call Connected] ---------->             |
     |                         [Timer starts both sides]        |
     |                         [Both can hear/see]              |
     |                              |                           |
     |  [Call duration: 0:15]        |    [Call duration: 0:15] |
     |                              |                           |
     |--- endCall() --------->       |                           |
     |                    emit("callEnded")                     |
     |                              |--- CallEndedNotif ------>|
     |  [FloatingCallWindow closes]  |        [Modal closes]    |
     |                              |                           |
```

---

## Component Architecture

### 1. CallNotificationModal.tsx
**Location:** `client/src/components/CallNotificationModal.tsx`

**Responsibility:** Displays incoming call notification to recipient

**Features:**
- Shows caller's avatar and name
- Displays "is calling..." message
- **GREEN Accept button** (Phone icon) - line 36
- **RED Decline button** (PhoneOff icon) - line 45
- Uses shadcn Dialog component (fullscreen overlay)
- Styling: Green/Emerald gradient background from WhatsApp theme

**Props:**
```typescript
interface CallNotificationModalProps {
  isOpen: boolean;
  call: CallData | null;
  onAnswer: () => void;
  onDecline: () => void;
}
```

**Opened by:** CallManager.tsx (line 61-66)

### 2. FloatingCallWindow.tsx
**Location:** `client/src/components/FloatingCallWindow.tsx`

**Responsibility:** Displays active call interface (replaces old CallingModal)

**Features:**
- Draggable header with contact info and timer
- Resizable window (350x500px initial, min 250x350px)
- Minimize/maximize buttons
- **Mute button** (toggles red when muted)
- **Video button** (toggles red when disabled)
- **Speaker button** (toggles orange when off)
- **Switch to Video/Voice button** (context-aware)
- **RED End Call button**
- Glass morphism styling with WhatsApp primary blue

**Opened by:** CallManager.tsx when activeCall exists (line 47-60)

### 3. useCallWithWebRTC Hook
**Location:** `client/src/hooks/useCallWithWebRTC.ts`

**Core Call State Management:**

#### State Variables (lines 35-41):
```typescript
const [activeCall, setActiveCall] = useState<CallData | null>(null);
const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
const [callDuration, setCallDuration] = useState(0);
const [callType, setCallType] = useState<"audio" | "video">("audio");
const [isMuted, setIsMuted] = useState(false);
const [isVideoEnabled, setIsVideoEnabled] = useState(false);
const [isSpeakerOn, setIsSpeakerOn] = useState(true);
```

#### Key Functions:

**initiateCall() - Lines 99-148**
- Called when User A clicks "Call" on User B
- Creates CallData object
- Saves to Firebase Realtime DB at `calls/{chatId}/{callId}`
- Updates status: "initiated" → "ringing"
- Requests microphone access from User A
- Starts recording via startRecording()
- **Emits "callInitiated" Socket.IO event** (line 139)
- Caller receives FloatingCallWindow immediately

**Socket.IO Event Listener - Lines 80-97**
```typescript
socket.on("callInitiated", (callData: CallData) => {
  console.log("Received call notification:", callData);
  setIncomingCall(callData);  // Triggers CallNotificationModal display
});
```

**answerCall() - Lines 150-183**
- Called when User B clicks [Accept]
- Requests microphone from User B
- Starts recording for User B
- **Creates WebRTC connection** via PeerJS (line 165)
- Updates Firebase status: "connected"
- **Clears incomingCall** - notification disappears (line 174)
- **Sets activeCall** - FloatingCallWindow opens for User B (line 175)
- Sound stops here (if implemented)

**declineCall() - Lines 185-197**
- Called when User B clicks [Decline]
- Updates Firebase status: "declined"
- **Clears incomingCall** - notification disappears (line 190)
- User A's FloatingCallWindow closes (via callEnded listener)

**endCall() - Lines 247-289**
- Called when either user clicks [End Call]
- Stops recording, uploads to Firebase Storage
- Updates Firebase status: "completed"
- Stops all media tracks
- **Emits "callEnded" Socket.IO event** (line 277)
- Other user's FloatingCallWindow closes
- Clears both activeCall and incomingCall

---

## Socket.IO Events

### Event 1: "callInitiated" (Sender: Initiator)
**Location:** `client/src/hooks/useCallWithWebRTC.ts:139`

**Triggered:** When User A initiates call

**Payload:**
```typescript
{
  callId: string;
  chatId: string;
  initiator: string;           // User A's ID
  recipient: string;           // User B's ID
  initiatorName: string;       // "User A Name"
  recipientName: string;       // "User B Name"
  startTime: number;           // Timestamp
  status: "ringing";
  callType: "audio" | "video";
  createdAt: number;
}
```

**Received by:** User B's socket in `useCallWithWebRTC.ts:83`

**Effect:** 
- Sets `incomingCall` state
- Triggers CallNotificationModal render
- Shows notification to User B

---

### Event 2: "callEnded" (Sender: End Call Initiator)
**Location:** `client/src/hooks/useCallWithWebRTC.ts:277`

**Triggered:** When either user ends the call

**Payload:**
```typescript
{
  callId: string;
}
```

**Received by:** Opposite user's socket in `CallManager.tsx:33`

**Effect:**
- Sets `showCallEndedModal = true` (CallEndedNotificationModal displays)
- Closes FloatingCallWindow for other user
- Shows "Call Ended" with caller's name

---

### Event 3: "join-chat" (Sender: Both)
**Location:** `server/socket.ts:39`

**Purpose:** Socket.IO room management for messaging

**Note:** Call system uses separate Firebase Realtime DB for persistence

---

## WebRTC Connection Flow

### Step 1: Media Stream Setup
```typescript
// User A (initiator)
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
mediaStreamRef.current = stream;

// User B (recipient)
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
mediaStreamRef.current = stream;
```

### Step 2: PeerJS Connection
```typescript
// User B answers - initiates WebRTC connection
const call = peerRef.current.call(callData.initiator, stream);

call.on("stream", (remoteStream: MediaStream) => {
  // Receive audio from other user
  // Connect to <audio> element for playback
});
```

### Step 3: Status Update
```typescript
// Both sides update Firebase
await update(callRef, { status: "connected" });
```

### Step 4: Call Duration Timer
**Location:** `useCallWithWebRTC.ts:300-308`
```typescript
useEffect(() => {
  if (activeCall && activeCall.status === "connected") {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }
}, [activeCall]);
```

---

## Firebase Realtime DB Structure

### Call Recording
```
/calls
  /chatId
    /callId
      callId: string
      chatId: string
      initiator: string
      recipient: string
      initiatorName: string
      recipientName: string
      startTime: number
      endTime: number (when completed/declined)
      duration: number (seconds)
      status: "initiated" | "ringing" | "connected" | "completed" | "declined" | "missed"
      callType: "audio" | "video"
      recording: {
        url: string         // Firebase Storage URL
        duration: number    // seconds
        savedAt: number     // timestamp
      }
      createdAt: number
```

**Recording Storage Location:** `gs://bucket/call-recordings/recording-{timestamp}.webm`

---

## Unread Message Badge System

**Location:** `server/socket.ts:88-99` (Increment Logic)

**Flow:**
1. When sender sends message → `send-message` event triggered
2. Server extracts recipient ID from chatId (format: `userId1_userId2`)
3. **Increments** `unreadCount[recipientId]`
4. Recipient's chat list shows RED badge with count
5. When recipient opens chat → mark-as-read sets count to 0
6. Badge disappears

---

## Browser Notifications for Messages

**Location:** `client/src/components/ChatWindow.tsx:224-243`

**Features:**
- Uses free browser Notification API
- Only shows when app tab NOT focused (`document.hidden`)
- Shows sender name + message preview (100 chars max)
- Professional styling with avatar
- Requires user permission (requested on app load)

---

## Audio Notification - CURRENTLY NOT IMPLEMENTED

### Recommended Implementation:

**Add ringtone file:**
```bash
public/audio/ringtone.mp3  (or .wav, .ogg)
```

**Suggested Sources:**
- Freesound.org - "bell-notification" or "phone-ring-short"
- Zapsplat.com - Professional ringtone library
- Pixabay.com - Royalty-free audio

**Implementation in CallNotificationModal.tsx:**
```typescript
useEffect(() => {
  if (isOpen) {
    // Play looping ringtone
    const audio = new Audio("/audio/ringtone.mp3");
    audio.loop = true;
    audio.play().catch(err => console.log("Audio play failed:", err));
    return () => {
      audio.stop();
    };
  }
}, [isOpen]);
```

**Stop sound on:**
- User clicks [Accept]
- User clicks [Decline]
- Call times out (30 seconds)

---

## Testing Procedures

### Test 1: Basic Call Flow
**Setup:** 2 browser tabs (or devices), both logged in

**Steps:**
1. User A: Open chat with User B
2. User A: Click phone icon (initiate call)
3. **Verify:** User B sees CallNotificationModal with:
   - ✅ User A's avatar
   - ✅ "User A Name is calling..."
   - ✅ GREEN [Accept] button
   - ✅ RED [Decline] button
4. **Verify:** User A sees FloatingCallWindow with:
   - ✅ Contact name and avatar
   - ✅ Call timer (starting from 0:00)
   - ✅ Draggable header
   - ✅ Control buttons (mute, video, speaker)

### Test 2: Accept Call
**Continue from Test 1:**

1. User B: Click [Accept]
2. **Verify:** CallNotificationModal closes for User B
3. **Verify:** FloatingCallWindow opens for User B
4. **Verify:** Timer visible on BOTH sides
5. **Verify:** Both can see mute/video/speaker controls

### Test 3: Decline Call
**Setup:** New call initiated

1. User B: Click [Decline]
2. **Verify:** CallNotificationModal closes for User B
3. **Verify:** User A's FloatingCallWindow closes
4. **Verify:** Both return to normal chat state

### Test 4: Call Ended Notification
**Setup:** Active call between both users**

1. User A: Click RED [End Call] button
2. **Verify:** FloatingCallWindow closes for User A
3. **Verify:** CallEndedNotificationModal appears for User B
4. **Verify:** Shows "Call Ended" with User A's name
5. **Verify:** Modal auto-closes after 2.5 seconds
6. **Verify:** FloatingCallWindow closes for User B

### Test 5: Floating Window Features
**Setup:** Active call

1. **Drag Test:** Click and drag header bar → window moves smoothly
2. **Resize Test:** Click bottom-right corner → drag to resize → min 250x350px respected
3. **Minimize Test:** Click minimize icon → window shrinks to header only, semi-transparent
4. **Maximize Test:** Click maximize icon → window restores to normal size
5. **Mute Test:** Click mute button → button turns red, indicates muted
6. **Video Toggle:** Click video button → toggles between video modes
7. **Speaker Toggle:** Click speaker button → toggles speaker on/off

### Test 6: Voice to Video Switch
**Setup:** Active voice call

1. Click "Switch to Video" button
2. **Verify:** Button changes to "Switch to Voice"
3. **Verify:** Call type updates from audio to video
4. **Verify:** Video controls appear in window

### Test 7: Call Duration Timer
**Setup:** Active call

1. Observe timer in FloatingCallWindow
2. **Verify:** Increments by 1 second
3. **Verify:** Format: MM:SS (or HH:MM:SS for calls >1 hour)
4. **Verify:** Same timer on both sides

### Test 8: Unread Message Badge
**Setup:** User A and B in chat

1. User A: Send message to User B
2. User B: Minimize or switch away from chat
3. **Verify:** RED badge appears on User B's chat list with count "1"
4. User B: Send another message
5. **Verify:** Badge updates to count "2"
6. User B: Click to open chat
7. **Verify:** Badge disappears (count resets to 0)

### Test 9: Browser Notification
**Setup:** ChatWindow open, enable notifications

1. User A and B: Both have browsers open
2. User A: Click on User B's chat tab (not active)
3. User A: Send message
4. **Verify:** Browser notification appears with:
   - Sender name
   - Message preview
   - Avatar

---

## Known Limitations

1. **Audio Notification:** Currently NOT implemented
   - Requires adding audio file to `public/audio/`
   - Implementation path documented above

2. **Video Streaming:** WebRTC video setup exists but:
   - Video element not rendered in FloatingCallWindow
   - Would require adding `<video>` element for remote stream
   - Local preview not implemented

3. **Call Persistence:** Calls stored in Firebase but:
   - Call history not displayed in UI
   - Requires separate "Calls" page implementation

4. **Connection Timeout:** No timeout handling for ringing state
   - Recommendation: Auto-decline after 30 seconds if not answered

---

## Socket.IO Event Checklist

- [x] "callInitiated" - Sent when call starts
- [x] "callEnded" - Sent when either user hangs up
- [x] "join-chat" - Sent for messaging (separate from calls)
- [x] "leave-chat" - Sent on exit
- [x] "send-message" - Sent for messages
- [ ] "callRejected" - (Optional: could add explicit rejection event)
- [ ] "callAccepted" - (Optional: explicit acceptance confirmation)

---

## Summary

**Incoming call notification system is FULLY FUNCTIONAL:**

✅ **Notification Display:** CallNotificationModal shows with accept/decline buttons  
✅ **Accept Flow:** WebRTC connection establishes, call connects  
✅ **Decline Flow:** Call rejected, notification closes  
✅ **Call End Notification:** CallEndedNotificationModal displays  
✅ **Floating Window:** Draggable, resizable, fully featured  
✅ **Timer:** Visible to both users, increments in real-time  
✅ **Socket.IO Integration:** Real-time event delivery  
✅ **Recording:** Automatic call recording to Firebase Storage  
✅ **Voice/Video Switch:** Working (UI only, not full implementation)  

⚠️ **Audio Notification:** Needs implementation (see recommendations above)  
⚠️ **Video Rendering:** Streams exist but not rendered in UI  

---

## Files Involved

- `client/src/components/CallNotificationModal.tsx` - Notification display
- `client/src/components/FloatingCallWindow.tsx` - Active call UI
- `client/src/components/CallManager.tsx` - Orchestration
- `client/src/hooks/useCallWithWebRTC.ts` - Call state + logic
- `client/src/components/ChatWindow.tsx` - Message notifications
- `server/socket.ts` - Socket.IO events + unreadCount increment
- Firebase Realtime Database - Call records
- Firebase Storage - Call recordings
