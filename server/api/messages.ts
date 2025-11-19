
import { Router } from "express";
import { realtimeDb } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.get("/:chatId/search", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const { query, startDate, endDate } = req.query;
    const userId = req.user!.uid;

    const messagesRef = realtimeDb.ref(`messages/${chatId}`);
    const snapshot = await messagesRef.get();
    
    if (!snapshot.exists()) {
      return res.json({ messages: [] });
    }

    let messages = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
      id,
      ...data
    }));

    if (query && typeof query === 'string') {
      const searchLower = query.toLowerCase();
      messages = messages.filter((msg: any) => 
        msg.text?.toLowerCase().includes(searchLower)
      );
    }

    if (startDate) {
      messages = messages.filter((msg: any) => msg.timestamp >= parseInt(startDate as string));
    }

    if (endDate) {
      messages = messages.filter((msg: any) => msg.timestamp <= parseInt(endDate as string));
    }

    messages.sort((a: any, b: any) => b.timestamp - a.timestamp);

    res.json({ messages: messages.slice(0, 50) });
  } catch (error) {
    console.error("Error searching messages:", error);
    res.status(500).json({ error: "Failed to search messages" });
  }
});

router.get("/:chatId/messages", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, before } = req.query;

    const messagesRef = realtimeDb.ref(`messages/${chatId}`);
    let query = messagesRef.orderByChild("timestamp");

    if (before) {
      query = query.endBefore(parseInt(before as string));
    }

    query = query.limitToLast(parseInt(limit as string));

    const snapshot = await query.get();
    
    if (!snapshot.exists()) {
      return res.json({ messages: [] });
    }

    const messages = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
      id,
      ...data
    })).filter((msg: any) => !msg.deleted);

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
