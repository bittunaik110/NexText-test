# NexText Voice Call Feature - Complete Documentation

## Overview

NexText includes a comprehensive **WebRTC-based voice calling system** that enables real-time peer-to-peer audio communication between users. The feature includes call history tracking, automatic call recording, and a professional call UI with intuitive controls.

## Key Features

✅ **Real-Time Voice Calls** - Peer-to-peer audio communication via WebRTC  
✅ **Call Notifications** - Incoming call alerts with answer/decline options  
✅ **Call Recording** - Automatic audio recording and Firebase Storage upload  
✅ **Call History** - Complete call logs with timestamps, duration, and recordings  
✅ **Audio Playback** - Built-in player to replay recorded calls with download option  
✅ **Status Indicators** - Contact online/offline status prevents calling offline users  
✅ **Call Duration Timer** - Real-time timer showing active call duration  
✅ **Mute/Unmute** - Toggle microphone during active calls  

## How to Use

### Initiating a Call

1. Navigate to **Chats** tab and open a conversation with a contact
2. Verify the contact is **online** (green pulsing dot next to their name)
3. Click the **phone icon (☎️)** in the chat header next to their name
4. Your app will show "Calling [Contact Name]..." in a modal

### Receiving a Call

1. When someone calls you, a **CallNotificationModal** appears
2. Shows caller's name and avatar
3. Click **Green phone button (✓)** to answer
4. Click **Red phone button (✗)** to decline
5. If declined, call is logged as "declined" in call history

### Active Call

Once connected:
- **Duration Timer** shows call length in MM:SS format
- **Mute Button** toggles microphone on/off
- **End Call Button** (red phone icon) terminates the call
- Call is automatically recorded (saved as .webm file)

### Call History

1. Navigate to **Calls** tab
2. See all recent calls sorted by timestamp
3. **Call Direction Icons**:
   - Blue outgoing arrow → Call you made
   - Green incoming arrow → Call you received
   - Red X → Missed/declined call
4. **Call Details**:
   - Contact name and avatar
   - Call type and direction
   - Timestamp ("1 hour ago", "2 days ago")
   - Duration if completed
5. **Play Recording** - If call has a recording:
   - Click play button next to call entry
   - Audio player appears with play/pause controls
   - Download button to save recording locally

## Technical Architecture

### WebRTC Implementation

**Library**: PeerJS (abstraction over WebRTC)  
**Connection Method**: Direct peer-to-peer with public signaling server  
**Audio Codec**: Browser default (usually opus)

```
User A Device → PeerJS Server → User B Device
                   (Signal only,
                  no audio passes)
```

### Call Flow

```
1. User A clicks call button
   ↓
2. useCallWithWebRTC hook initiates call
   ↓
3. Call saved to Firebase: calls/{chatId}/{callId}
   ↓
4. Socket.IO emits 'callInitiated' event
   ↓
5. User B receives notification (CallNotificationModal)
   ↓
6. User B clicks Answer
   ↓
7. Microphone permission requested (both users)
   ↓
8. PeerJS establishes peer connection
   ↓
9. Media streams exchanged (audio only)
   ↓
10. Both CallingModals show with duration timer
   ↓
11. MediaRecorder API captures audio
   ↓
12. User ends call
   ↓
13. Recording uploaded to Firebase Storage
   ↓
14. Call status updated: "completed"
   ↓
15. Call history updated with duration + recording URL
```

### Database Schema

**Collection**: `calls/{chatId}/{callId}`

```json
{
  "callId": "1764017299468-abc123",
  "chatId": "77p7TLVAUWYl79P57fe42IqxR4t1_ZXDqPvPMrOcMl00cXaKs5f6FHwU2",
  "initiator": "77p7TLVAUWYl79P57fe42IqxR4t1",
  "recipient": "ZXDqPvPMrOcMl00cXaKs5f6FHwU2",
  "initiatorName": "John Doe",
  "recipientName": "Jane Smith",
  "startTime": 1764017299468,
  "endTime": 1764017359468,
  "duration": 60,
  "status": "completed",
  "callType": "audio",
  "recording": {
    "url": "https://firebasestorage.googleapis.com/.../recording-1764017299468.webm",
    "duration": 60,
    "savedAt": 1764017359500
  },
  "createdAt": 1764017299468
}
```

### Storage Schema

**Bucket**: `call-recordings/`

```
call-recordings/
  └─ recording-1764017299468.webm (WebM audio format)
  └─ recording-1764017299500.webm
  └─ ... (one file per call)
```

## Component Structure

### Main Components

**`CallManager.tsx`** - Orchestrator component
- Manages call state globally
- Renders CallingModal and CallNotificationModal
- Placed in App.tsx for global availability

**`useCallWithWebRTC.ts`** - Core hook
- Manages PeerJS connection
- Handles call initiation, answer, decline, end
- Records audio with MediaRecorder
- Saves to Firebase + Storage
- Listens for Socket.IO events

**`CallingModal.tsx`** - Active call UI
- Shows contact name and avatar
- Duration timer (MM:SS format)
- Mute/unmute button
- End call button
- Centered design, semi-transparent background

**`CallNotificationModal.tsx`** - Incoming call UI
- Shows caller name and avatar
- "is calling..." message
- Answer button (green)
- Decline button (red)
- Prevents dismissal by clicking outside

**`CallButton.tsx`** - Call initiation button
- Phone icon button in chat header
- Disabled if contact is offline
- Tooltip shows "Call" or "User is offline"
- Triggers call initiation on click

**`AudioPlayer.tsx`** - Recording playback
- Play/pause button
- Timeline scrubber
- Duration display
- Download button
- Used in Calls page for recordings

## Testing Guide

### Prerequisites

- Two devices or two browser tabs
- Same NexText app deployed
- Different user accounts logged in each
- Microphones enabled

### Test Scenario 1: Basic Call Flow

```
Tab A (User: John)          Tab B (User: Jane)
├─ Open Chat with Jane
├─ Verify Jane is online ✓
├─ Click phone icon
│  ↓
│  Calling modal appears
│                           ├─ CallNotificationModal appears
│                           ├─ Click Answer
│                           ├─ Microphone permission granted
│                           ├─ Duration timer starts
│
├─ Duration timer starts    ├─ Can see duration timer
├─ Can speak & hear ✓       ├─ Can speak & hear ✓
├─ Click End Call           
│  ↓
│  Recording uploaded       ├─ Call ends automatically
│  Modal closes             ├─ Modal closes
│
├─ Go to Calls tab
│  ├─ See "Jane" with outgoing arrow
│  ├─ Duration shows "01:23"
│  ├─ See play button
│  ├─ Click play
│  └─ Hear recording ✓
```

### Test Scenario 2: Decline Call

```
Tab A                       Tab B
├─ Click call
│  ↓                        ├─ Notification appears
│  Calling modal appears    ├─ Click Decline
│                           ├─ Modal closes
├─ Calling modal closes
│  (after timeout)
├─ Go to Calls tab
│  ├─ See call as "declined"
```

### Test Scenario 3: Offline User

```
Tab A
├─ Contact is showing offline (yellow dot)
├─ Click phone icon
│  ✗ Button is disabled, no action
└─ Tooltip shows "User is offline"
```

### Edge Cases to Test

- [ ] Call while contact just went offline mid-call
- [ ] Multiple calls from different contacts
- [ ] Declining call immediately (< 1 second)
- [ ] Very long call (> 1 hour)
- [ ] Mobile viewport call experience
- [ ] Switching browser tabs during call
- [ ] Closing browser during call
- [ ] Recording upload failure (check error handling)
- [ ] Microphone not available
- [ ] Call with very poor connection

## Troubleshooting

### "Call button is disabled even though contact is online"

**Cause**: Contact online status not syncing  
**Solution**:
1. Verify contact has their app open
2. Check Firebase `presence/{userId}` shows `isOnline: true`
3. Refresh page to resync presence

### "Can't hear audio during call"

**Cause**: Microphone permission denied or audio codec mismatch  
**Solution**:
1. Check browser microphone permissions
2. Reload page
3. Check browser console for WebRTC errors
4. Test with different browser

### "Recording not saved"

**Cause**: Firebase Storage upload failed  
**Solution**:
1. Check Firebase Storage permissions in rules
2. Check console logs for upload errors
3. Verify Firebase Storage bucket exists
4. Check available browser storage space

### "Calling modal doesn't appear"

**Cause**: CallManager not rendered in App.tsx  
**Solution**:
1. Verify CallManager is imported in App.tsx
2. Ensure CallManager is rendered in JSX
3. Check browser console for React errors
4. Verify useCallWithWebRTC hook is working (check logs)

### "PeerJS connection fails"

**Cause**: PeerJS server unavailable or network issue  
**Solution**:
1. Check internet connection
2. Try different PeerJS server (currently using peerjs-server.com)
3. Consider self-hosted PeerJS server for production
4. Check browser network tab for CORS errors

## Known Limitations

⚠️ **Audio Only** - Video calling not yet implemented  
⚠️ **No Call Transfer** - Can't transfer calls to others  
⚠️ **Group Calls Not Supported** - Only 1-on-1 calls  
⚠️ **WebM Format** - Recordings saved as WebM (may not play on all devices)  
⚠️ **Recording Always On** - Can't opt out of recording  
⚠️ **No Call Encryption** - Calls use WebRTC default encryption (DTLS-SRTP)  
⚠️ **No Do Not Disturb** - All incoming calls show notifications  

## Future Enhancements

🚀 **Video Calling** - Add video streams via WebRTC  
🚀 **Call Transfer** - Transfer ongoing calls to other contacts  
🚀 **Group Calls** - Multi-party conference calling  
🚀 **Ringtone/Sounds** - Custom notification sounds  
🚀 **Call Voicemail** - Leave messages for offline users  
🚀 **Call Scheduling** - Schedule calls in advance  
🚀 **Recording Encryption** - Encrypt stored recordings  
🚀 **Self-Hosted PeerJS** - Deploy own PeerJS server  

## File Locations

```
client/src/
├─ hooks/
│  ├─ useCallWithWebRTC.ts (Core call logic)
│  └─ useCall.ts (Basic call hook - legacy)
├─ components/
│  ├─ CallManager.tsx (Global orchestrator)
│  ├─ CallButton.tsx (Initiate call)
│  ├─ CallingModal.tsx (Active call UI)
│  ├─ CallNotificationModal.tsx (Incoming notification)
│  └─ AudioPlayer.tsx (Playback & download)
└─ pages/
   └─ calls.tsx (Call history list)
```

## Configuration

### Firebase Setup Required

1. **Realtime Database**
   ```
   Enable rules for calls collection
   allow read, write: if request.auth != null;
   ```

2. **Cloud Storage**
   ```
   Enable rules for recordings
   allow read, write: if request.auth != null;
   ```

3. **Storage Limits**
   - Recommend 50GB for production
   - Implement cleanup for calls > 30 days old

### PeerJS Configuration

Current: Public PeerJS server (peerjs-server.com)  
For production, consider:
- Self-hosted PeerJS server
- Custom STUN/TURN servers for better NAT traversal

## Support & Issues

For bugs or feature requests:
1. Check call status in Firebase console
2. Review browser console logs
3. Test with different contacts/browsers
4. Check network conditions (latency, bandwidth)

Last Updated: November 25, 2025  
Status: Production Ready ✅
