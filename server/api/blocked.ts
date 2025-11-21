import { Router } from "express";
import { db } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/block", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { blockedUserId, reason } = req.body;
    const userId = req.user!.uid;

    if (!blockedUserId) {
      return res.status(400).json({ error: "Blocked user ID is required" });
    }

    if (blockedUserId === userId) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }

    const existingBlock = await db
      .collection("users")
      .doc(userId)
      .collection("blocked")
      .doc(blockedUserId)
      .get();

    if (existingBlock.exists) {
      return res.status(400).json({ error: "User is already blocked" });
    }

    const blockData = {
      blockedUserId,
      blockedAt: new Date().toISOString(),
      reason: reason || "",
    };

    await db
      .collection("users")
      .doc(userId)
      .collection("blocked")
      .doc(blockedUserId)
      .set(blockData);

    res.json({ success: true, message: "User blocked successfully", block: blockData });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ error: "Failed to block user" });
  }
});

router.delete("/unblock/:blockedUserId", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { blockedUserId } = req.params;
    const userId = req.user!.uid;

    const blockDoc = await db
      .collection("users")
      .doc(userId)
      .collection("blocked")
      .doc(blockedUserId)
      .get();

    if (!blockDoc.exists) {
      return res.status(404).json({ error: "User is not blocked" });
    }

    await db
      .collection("users")
      .doc(userId)
      .collection("blocked")
      .doc(blockedUserId)
      .delete();

    res.json({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ error: "Failed to unblock user" });
  }
});

router.get("/list", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;

    const blockedSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("blocked")
      .orderBy("blockedAt", "desc")
      .get();

    const blockedUsers = await Promise.all(
      blockedSnapshot.docs.map(async (doc) => {
        const blockData = doc.data();
        const userDoc = await db.collection("users").doc(blockData.blockedUserId).get();
        const userData = userDoc.data();

        return {
          id: blockData.blockedUserId,
          displayName: userData?.displayName || "Unknown User",
          photoURL: userData?.photoURL || "",
          blockedAt: blockData.blockedAt,
          reason: blockData.reason,
        };
      })
    );

    res.json({ success: true, blockedUsers });
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    res.status(500).json({ error: "Failed to fetch blocked users" });
  }
});

router.get("/check/:userId", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.user!.uid;

    const blockDoc = await db
      .collection("users")
      .doc(userId)
      .collection("blocked")
      .doc(targetUserId)
      .get();

    res.json({ 
      success: true, 
      isBlocked: blockDoc.exists,
      blockedAt: blockDoc.exists ? blockDoc.data()?.blockedAt : null
    });
  } catch (error) {
    console.error("Error checking if user is blocked:", error);
    res.status(500).json({ error: "Failed to check block status" });
  }
});

export default router;
