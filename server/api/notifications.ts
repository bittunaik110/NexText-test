
import { Router } from "express";
import { db, firebaseAdmin } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/register-token", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { fcmToken, platform } = req.body;
    const userId = req.user!.uid;

    await db.collection("users").doc(userId).update({
      fcmTokens: firebaseAdmin.firestore.FieldValue.arrayUnion({
        token: fcmToken,
        platform,
        registeredAt: new Date().toISOString()
      })
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    res.status(500).json({ error: "Failed to register token" });
  }
});

router.post("/send", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId: recipientId, title, body, data } = req.body;
    const senderId = req.user!.uid;

    const userDoc = await db.collection("users").doc(recipientId).get();
    const userData = userDoc.data();

    if (!userData?.fcmTokens || userData.fcmTokens.length === 0) {
      return res.json({ success: false, message: "No FCM tokens found" });
    }

    const tokens = userData.fcmTokens.map((t: any) => t.token);

    const message = {
      notification: {
        title,
        body
      },
      data: data || {},
      tokens
    };

    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });

    if (failedTokens.length > 0) {
      await db.collection("users").doc(recipientId).update({
        fcmTokens: firebaseAdmin.firestore.FieldValue.arrayRemove(
          ...userData.fcmTokens.filter((t: any) => failedTokens.includes(t.token))
        )
      });
    }

    res.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount 
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

router.put("/preferences", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const { 
      enablePush, 
      enableInApp, 
      enableEmail, 
      muteUntil,
      mutedChats 
    } = req.body;

    await db.collection("users").doc(userId).update({
      notificationPreferences: {
        enablePush: enablePush ?? true,
        enableInApp: enableInApp ?? true,
        enableEmail: enableEmail ?? false,
        muteUntil: muteUntil || null,
        mutedChats: mutedChats || []
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
