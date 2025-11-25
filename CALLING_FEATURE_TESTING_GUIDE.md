# WebRTC Calling Feature - Testing Guide

## ✅ FIXES COMPLETED

### Critical Bug Fixed: State Synchronization Mismatch

**Problem Identified:**
- CallButton.tsx was using `useCall()` hook
- CallManager.tsx was using `useCallWithWebRTC()` hook  
- Two separate state systems = modals never appeared when call button clicked

**Solution Applied:**
Changed `client/src/components/CallButton.tsx` line 2-3 and line 21:
```javascript
// BEFORE
import { useCall } from "@/hooks/useCall";
...
const { initiateCall } = useCall();

// AFTER  
import { useCallWithWebRTC } from "@/hooks/useCallWithWebRTC";
...
const { initiateCall } = useCallWithWebRTC();
```

**Result:** Both CallButton and CallManager now use the same `useCallWithWebRTC()` hook, sharing unified call state. When the call button is clicked, it updates the same state that CallManager monitors, triggering modal display.

---

## 📋 STEP-BY-STEP TESTING PROCEDURE

### Setup
1. You need **2 browser tabs or 2 devices** with different user accounts logged in
   - Tab A: User "John" (or any first user)
   - Tab B: User "Jane" (or any second user)

### Test Scenario: Basic Call Flow

**In Tab A (John's account):**
```
1. Navigate to Chats tab
2. Click on conversation with "Jane" (or "W" if that's the contact name)
3. Look at the chat header - should show:
   ✓ Contact name "Jane"
   ✓ Online status indicator (GREEN PULSING DOT = online, YELLOW DOT = offline)
   ✓ Phone icon button (should NOT be disabled)

4. Click the PHONE ICON button
   ✓ CallingModal should appear with:
     - Contact's avatar
     - Contact's name
     - Duration timer starting at 0:00 (or counting up)
     - "Calling Jane..." status text
     - Mute button (microphone icon)
     - End Call button (red phone icon)
   ✓ Screen should show the modal as semi-transparent overlay
```

**In Tab B (Jane's account) - SIMULTANEOUSLY:**
```
5. Within 10 seconds, CallNotificationModal should appear with:
   ✓ John's avatar
   ✓ "John is calling..." message
   ✓ Green "Answer" button (phone icon)
   ✓ Red "Decline" button (phone icon with X)

6. Click the green Answer button
   ✓ In Tab A: CallingModal should show duration timer now counting up
   ✓ In Tab B: CallNotificationModal should close and CallingModal should appear

7. In Tab A: Click End Call button
   ✓ Both CallingModals should close
   ✓ Call should be recorded and saved
   ✓ No errors in console

8. Go to Calls tab in both windows
   ✓ New call should appear in history
   ✓ Shows John's outgoing call (arrow →) in Tab A
   ✓ Shows Jane's incoming call (arrow ←) in Tab B
   ✓ Duration shows call length
   ✓ Recording available to play
```

---

## 🧪 ADDITIONAL TESTS

### Test Declining a Call
```
Tab A: Click call
  ↓
Tab B: CallNotificationModal appears
  ↓
Tab B: Click red Decline button
  ↓
Tab A: CallingModal closes (after timeout)
Tab B: Notification disappears
  ↓
Both Tabs: Check Calls history
  ✓ Call shows as "declined"
```

### Test Offline User
```
1. Contact "Jane" closes their app or goes offline
2. In Tab A, chat header shows YELLOW DOT (offline)
3. Phone button becomes DISABLED
4. Hovering over phone button shows "User is offline" tooltip
5. Clicking disabled button does nothing
```

### Test Multiple Calls
```
1. Receive call from Contact A while on call with Contact B
2. Should show queue/notification (or replace current modal)
3. Verify only one active call at a time
4. Check call history records all calls
```

---

## 🔍 WHAT TO LOOK FOR

### Success Indicators ✅
- [ ] Call button disabled when contact is offline (yellow dot)
- [ ] Call button enabled when contact is online (green pulsing dot)
- [ ] CallingModal appears immediately when call button clicked
- [ ] CallNotificationModal appears on recipient's device within 3 seconds
- [ ] Duration timer counts up from 0:00
- [ ] End Call button properly closes modals
- [ ] Call recorded and saved to Firebase
- [ ] Call appears in history with correct metadata
- [ ] Audio player works on recorded call in Calls page
- [ ] No console errors during any of the above

### Error Indicators ❌
- [ ] Call button always disabled (even for online users)
- [ ] Call button doesn't trigger modal
- [ ] Modals appear but don't show contact info
- [ ] Duration timer doesn't update
- [ ] Red console errors in DevTools
- [ ] Calls not appearing in history
- [ ] Recording upload fails

---

## 🛠️ TECHNICAL VERIFICATION

### Code Changes Made
```
File: client/src/components/CallButton.tsx
Line 2: import { useCallWithWebRTC } from "@/hooks/useCallWithWebRTC";
Line 24: const { initiateCall } = useCallWithWebRTC();
```

### Architecture Flow (Now Fixed)
```
User clicks phone button
    ↓
CallButton.tsx → useCallWithWebRTC() hook
    ↓
initiateCall() saves call to Firebase
    ↓
Socket.IO emits "callInitiated" event
    ↓
CallManager.tsx monitors useCallWithWebRTC() state
    ↓
When activeCall state updates, CallingModal renders
    ↓
When incomingCall state updates, CallNotificationModal renders
```

### Build Status
```
✓ Client build: SUCCESS (2156 modules transformed, 21.60s)
✓ Server running: Port 5000
✓ Firebase connected: Admin SDK initialized
✓ No compilation errors
✓ No LSP errors (previously had 2, fixed)
```

---

## 📱 MOBILE & EDGE CASES

### Mobile Viewport Testing
1. Resize to iPhone width (375px)
2. CallingModal should stack vertically
3. Buttons should remain accessible
4. Duration timer should be readable

### Edge Cases to Verify
- [ ] Call while contact becomes offline
- [ ] Very quick disconnect (< 1 second call)
- [ ] Long call (> 10 minutes)
- [ ] Multiple rapid calls in succession
- [ ] Browser tab switch during call
- [ ] Network disconnection mid-call
- [ ] Recording upload when offline then back online

---

## 📊 SUCCESS METRICS

Once these tests pass, the calling feature is **Production Ready**:

| Feature | Expected | Status |
|---------|----------|--------|
| Call Initiation | Modal appears on click | ⏳ Pending Test |
| Call Notification | Modal appears on recipient | ⏳ Pending Test |
| Call Duration | Timer counts from 0:00 | ⏳ Pending Test |
| Call Recording | Audio saved to Firebase Storage | ⏳ Pending Test |
| Call History | Visible in Calls page | ⏳ Pending Test |
| Call Playback | Audio player functional | ⏳ Pending Test |
| Online Status | Green dot when online | ⏳ Pending Test |
| Offline Status | Yellow dot, button disabled | ⏳ Pending Test |

---

## 🚀 NEXT STEPS AFTER TESTING

Once calling feature is verified working:
1. Test read receipts fix (blue checkmarks)
2. Implement voice message recording
3. Add image upload preview
4. Implement message reactions UI
5. Add reply/quote functionality

---

**Version:** 1.0  
**Date:** November 25, 2025  
**Status:** Ready for User Testing  
**Components:** CallButton, CallingModal, CallNotificationModal, CallManager, useCallWithWebRTC
