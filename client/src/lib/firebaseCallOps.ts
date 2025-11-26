import { database } from "@/lib/firebase";
import { ref, set, update, get, query, orderByChild, equalTo, onValue } from "firebase/database";

export interface CallData {
  callId: string;
  callType: 'audio' | 'video';
  chatId: string;
  initiator: {
    odId: string;
    username: string;
    avatar?: string;
  };
  recipient: {
    odId: string;
    username: string;
    avatar?: string;
  };
  status: 'initiating' | 'ringing' | 'ongoing' | 'ended' | 'missed' | 'declined';
  startTime?: number;
  endTime?: number;
  duration?: number;
  callRecordURL?: string;
  createdAt: number;
}

/**
 * Save a new call to Firebase
 */
export async function saveCall(callData: CallData): Promise<void> {
  try {
    const callRef = ref(database, `calls/${callData.callId}`);
    await set(callRef, {
      ...callData,
      createdAt: callData.createdAt || Date.now(),
      status: callData.status || 'initiating',
    });
    console.log(`✅ Call saved to Firebase: ${callData.callId}`);
  } catch (error) {
    console.error("Error saving call to Firebase:", error);
    throw error;
  }
}

/**
 * Update the status of an existing call
 */
export async function updateCallStatus(
  callId: string,
  status: CallData['status'],
  additionalData?: Partial<CallData>
): Promise<void> {
  try {
    const callRef = ref(database, `calls/${callId}`);
    const updates: Record<string, any> = {
      status,
      ...additionalData,
    };

    // Set end time if status is ended, missed, or declined
    if (['ended', 'missed', 'declined'].includes(status) && !additionalData?.endTime) {
      updates.endTime = Date.now();
    }

    // Calculate duration if we have startTime and endTime
    if (updates.startTime && updates.endTime) {
      updates.duration = Math.floor((updates.endTime - updates.startTime) / 1000); // duration in seconds
    }

    await update(callRef, updates);
    console.log(`✅ Call ${callId} status updated to: ${status}`);
  } catch (error) {
    console.error("Error updating call status:", error);
    throw error;
  }
}

/**
 * Get all calls involving a user (as initiator or recipient)
 */
export async function getCallHistory(userId: string): Promise<CallData[]> {
  try {
    const callsRef = ref(database, 'calls');
    const snapshot = await get(callsRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const calls: CallData[] = [];
    snapshot.forEach((childSnapshot) => {
      const callData = childSnapshot.val() as CallData;
      // Include calls where user is initiator or recipient
      if (callData.initiator.odId === userId || callData.recipient.odId === userId) {
        calls.push(callData);
      }
    });

    // Sort by creation time (newest first)
    calls.sort((a, b) => b.createdAt - a.createdAt);
    console.log(`✅ Retrieved ${calls.length} calls for user ${userId}`);
    return calls;
  } catch (error) {
    console.error("Error retrieving call history:", error);
    throw error;
  }
}

/**
 * Listen to real-time updates for a specific call
 */
export function listenToCall(
  callId: string,
  onUpdate: (callData: CallData) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const callRef = ref(database, `calls/${callId}`);
    
    const unsubscribe = onValue(
      callRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.val());
        }
      },
      (error) => {
        console.error("Error listening to call:", error);
        onError?.(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up call listener:", error);
    throw error;
  }
}

/**
 * Get a specific call by ID
 */
export async function getCallById(callId: string): Promise<CallData | null> {
  try {
    const callRef = ref(database, `calls/${callId}`);
    const snapshot = await get(callRef);
    
    if (snapshot.exists()) {
      console.log(`✅ Retrieved call ${callId}`);
      return snapshot.val() as CallData;
    }
    
    console.log(`Call ${callId} not found`);
    return null;
  } catch (error) {
    console.error("Error retrieving call by ID:", error);
    throw error;
  }
}
