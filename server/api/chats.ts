import { Router } from "express";
import { db } from "../firebase-admin";
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

    const existingChats = await db
      .collection("chats")
      .where("participants", "==", participants)
      .limit(1)
      .get();

    if (!existingChats.empty) {
      const existingChat = existingChats.docs[0];
      return res.json({ chatId: existingChat.id, chat: existingChat.data() });
    }

    const chatData = {
      participants,
      createdAt: new Date().toISOString(),
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: {
        [userId]: 0,
        [participantId]: 0,
      },
    };

    const chatRef = await db.collection("chats").add(chatData);

    res.json({ chatId: chatRef.id, chat: chatData });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

router.get("/list", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;

    const chatsSnapshot = await db
      .collection("chats")
      .where("participants", "array-contains", userId)
      .orderBy("lastMessageTime", "desc")
      .get();

    const chats = await Promise.all(
      chatsSnapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        const otherUserId = chatData.participants.find((p: string) => p !== userId);

        const userDoc = await db.collection("users").doc(otherUserId).get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          ...chatData,
          participant: {
            id: otherUserId,
            displayName: userData?.displayName || "Unknown",
            photoURL: userData?.photoURL || "",
          },
        };
      })
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

    const chatDoc = await db.collection("chats").doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ chat: { id: chatDoc.id, ...chatData } });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.put("/:chatId/read", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user!.uid;

    const chatDoc = await db.collection("chats").doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.collection("chats").doc(chatId).update({
      [`unreadCount.${userId}`]: 0,
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

    const chatDoc = await db.collection("chats").doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Mark chat as deleted instead of actually deleting
    await db.collection("chats").doc(chatId).update({
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

    const chatDoc = await db.collection("chats").doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.collection("chats").doc(chatId).update({
      [`archived.${userId}`]: archived !== false,
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

    const chatDoc = await db.collection("chats").doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.collection("chats").doc(chatId).update({
      [`pinned.${userId}`]: pinned !== false,
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

    const chatDoc = await db.collection("chats").doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const muteTimestamp = muteUntil ? new Date(muteUntil).toISOString() : null;

    await db.collection("chats").doc(chatId).update({
      [`muted.${userId}`]: muteTimestamp,
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

    const chatDoc = await db.collection("chats").doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();

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

    const chatDoc = await db.collection("chats").doc(chatId).get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chatData = chatDoc.data();

    if (!chatData?.participants.includes(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updates: any = {};

    if (notifications) {
      updates[`notificationSettings.${userId}`] = {
        enabled: notifications.enabled !== false,
        sound: notifications.sound !== false,
        vibrate: notifications.vibrate !== false,
      };
    }

    if (theme) {
      updates[`theme.${userId}`] = {
        backgroundColor: theme.backgroundColor || null,
        emoji: theme.emoji || null,
      };
    }

    await db.collection("chats").doc(chatId).update(updates);

    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating chat settings:", error);
    res.status(500).json({ error: "Failed to update chat settings" });
  }
});

export default router;