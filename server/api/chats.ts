import { Router } from "express";
import { db, realtimeDb } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/create", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user!.uid;

    if (!participantId) {
      return res.status(400).json({ error: "Participant ID is required" });
    }

    if (participantId === userId) {
      return res.status(400).json({ error: "Cannot create chat with yourself" });
    }

    const participants = [userId, participantId].sort();
    const chatId = `${participants[0]}_${participants[1]}`;

    // Check if chat already exists in Realtime Database
    const chatsSnapshot = await realtimeDb.ref('chats').get();
    
    if (chatsSnapshot.exists()) {
      const chats = chatsSnapshot.val();
      if (chats && chats[chatId]) {
        return res.json({ chatId, chat: chats[chatId] });
      }
    }

    // Get user data from Firestore
    const user1Doc = await db.collection("users").doc(userId).get();
    const user2Doc = await db.collection("users").doc(participantId).get();

    const user1Data = user1Doc.data();
    const user2Data = user2Doc.data();

    const chatData = {
      participants,
      createdAt: new Date().toISOString(),
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: {
        [userId]: 0,
        [participantId]: 0,
      },
      deleted: false,
      participantNames: {
        [userId]: user1Data?.displayName || "Unknown",
        [participantId]: user2Data?.displayName || "Unknown",
      },
      participantPhotos: {
        [userId]: user1Data?.photoURL || "",
        [participantId]: user2Data?.photoURL || "",
      },
    };

    // Store in Realtime Database
    await realtimeDb.ref(`chats/${chatId}`).set(chatData);

    res.json({ chatId, chat: chatData });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

router.get("/list", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;

    const chatsSnapshot = await realtimeDb.ref('chats').get();

    const chatsData = chatsSnapshot.val();
    if (!chatsData) {
      return res.json({ chats: [] });
    }

    const chats = Object.entries(chatsData)
      .map(([chatId, chatData]: [string, any]) => {
        if (!chatData.participants.includes(userId) || chatData.deleted) {
          return null;
        }

        const otherUserId = chatData.participants.find((p: string) => p !== userId);

        return {
          id: chatId,
          ...chatData,
          participant: {
            id: otherUserId,
            displayName: chatData.participantNames?.[otherUserId] || "Unknown",
            photoURL: chatData.participantPhotos?.[otherUserId] || "",
          },
        };
      })
      .filter((chat): chat is any => chat !== null)
      .sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

    res.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

router.get("/:chatId", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;

    const chatSnapshot = await realtimeDb.ref(`chats/${chatId}`).get();

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatSnapshot.val();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ chat: { id: chatId, ...chatData } });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.put("/:chatId/read", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;

    const chatSnapshot = await realtimeDb.ref(`chats/${chatId}`).get();

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatSnapshot.val();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await realtimeDb.ref(`chats/${chatId}`).update({
      [`unreadCount/${userId}`]: 0,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res.status(500).json({ error: "Failed to mark chat as read" });
  }
});

router.delete("/:chatId", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;

    const chatSnapshot = await realtimeDb.ref(`chats/${chatId}`).get();

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatSnapshot.val();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Mark chat as deleted instead of actually deleting
    await realtimeDb.ref(`chats/${chatId}`).update({
      deleted: true,
    });

    res.json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

router.post("/:chatId/archive", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;
    const { archived } = req.body;

    const chatSnapshot = await realtimeDb.ref(`chats/${chatId}`).get();

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatSnapshot.val();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await realtimeDb.ref(`chats/${chatId}`).update({
      [`archived/${userId}`]: archived !== false,
    });

    res.json({ success: true, archived: archived !== false });
  } catch (error) {
    console.error("Error archiving chat:", error);
    res.status(500).json({ error: "Failed to archive chat" });
  }
});

router.post("/:chatId/pin", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;
    const { pinned } = req.body;

    const chatSnapshot = await realtimeDb.ref(`chats/${chatId}`).get();

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatSnapshot.val();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await realtimeDb.ref(`chats/${chatId}`).update({
      [`pinned/${userId}`]: pinned !== false,
    });

    res.json({ success: true, pinned: pinned !== false });
  } catch (error) {
    console.error("Error pinning chat:", error);
    res.status(500).json({ error: "Failed to pin chat" });
  }
});

router.post("/:chatId/mute", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;
    const { muteUntil } = req.body;

    const chatSnapshot = await realtimeDb.ref(`chats/${chatId}`).get();

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatSnapshot.val();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const muteTimestamp = muteUntil ? new Date(muteUntil).toISOString() : null;

    await realtimeDb.ref(`chats/${chatId}`).update({
      [`muted/${userId}`]: muteTimestamp,
    });

    res.json({ success: true, mutedUntil: muteTimestamp });
  } catch (error) {
    console.error("Error muting chat:", error);
    res.status(500).json({ error: "Failed to mute chat" });
  }
});

router.get("/:chatId/settings", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;

    const chatSnapshot = await realtimeDb.ref(`chats/${chatId}`).get();

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatSnapshot.val();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const settings = {
      archived: chatData?.archived?.[userId] || false,
      pinned: chatData?.pinned?.[userId] || false,
      muted: chatData?.muted?.[userId] || null,
      notifications: chatData?.notificationSettings?.[userId] || {
        enabled: true,
        sound: true,
        vibrate: true,
      },
      theme: chatData?.theme?.[userId] || {
        backgroundColor: null,
        emoji: null,
      },
    };

    res.json({ success: true, settings });
  } catch (error) {
    console.error("Error fetching chat settings:", error);
    res.status(500).json({ error: "Failed to fetch chat settings" });
  }
});

router.put("/:chatId/settings", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;
    const { notifications, theme } = req.body;

    const chatSnapshot = await realtimeDb.ref(`chats/${chatId}`).get();

    if (!chatSnapshot.exists()) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatSnapshot.val();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updates: any = {};

    if (notifications) {
      updates[`notificationSettings/${userId}`] = {
        enabled: notifications.enabled !== false,
        sound: notifications.sound !== false,
        vibrate: notifications.vibrate !== false,
      };
    }

    if (theme) {
      updates[`theme/${userId}`] = {
        backgroundColor: theme.backgroundColor || null,
        emoji: theme.emoji || null,
      };
    }

    await realtimeDb.ref(`chats/${chatId}`).update(updates);

    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating chat settings:", error);
    res.status(500).json({ error: "Failed to update chat settings" });
  }
});

export default router;
