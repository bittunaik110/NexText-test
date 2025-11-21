import { Router } from "express";
import { db } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/upload", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { mediaUrl, mediaType, textContent } = req.body;
    const userId = req.user!.uid;

    if (!mediaUrl && !textContent) {
      return res.status(400).json({ error: "Either media or text content is required" });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const statusData = {
      userId,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || "text",
      textContent: textContent || null,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      viewCount: 0,
      viewers: [],
    };

    const statusRef = await db.collection("status").add(statusData);

    res.json({ 
      success: true, 
      status: { id: statusRef.id, ...statusData } 
    });
  } catch (error) {
    console.error("Error uploading status:", error);
    res.status(500).json({ error: "Failed to upload status" });
  }
});

router.get("/list", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const now = new Date().toISOString();

    const contactsSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("contacts")
      .get();

    const contactIds = contactsSnapshot.docs.map(doc => doc.data().userId);
    contactIds.push(userId);

    const statusSnapshot = await db
      .collection("status")
      .where("userId", "in", contactIds.length > 0 ? contactIds.slice(0, 10) : [userId])
      .where("expiresAt", ">", now)
      .orderBy("expiresAt")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const statusUpdates = await Promise.all(
      statusSnapshot.docs.map(async (doc) => {
        const statusData = doc.data();
        const userDoc = await db.collection("users").doc(statusData.userId).get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          userId: statusData.userId,
          mediaUrl: statusData.mediaUrl,
          mediaType: statusData.mediaType,
          textContent: statusData.textContent,
          createdAt: statusData.createdAt,
          expiresAt: statusData.expiresAt,
          viewCount: statusData.viewCount,
          viewers: statusData.viewers,
          user: {
            id: statusData.userId,
            displayName: userData?.displayName || "Unknown",
            photoURL: userData?.photoURL || "",
          },
          hasViewed: statusData.viewers?.includes(userId) || false,
        };
      })
    );

    const groupedByUser = statusUpdates.reduce((acc: any, status) => {
      const uid = status.user.id;
      if (!acc[uid]) {
        acc[uid] = {
          userId: uid,
          user: status.user,
          statuses: [],
        };
      }
      acc[uid].statuses.push(status);
      return acc;
    }, {});

    res.json({ 
      success: true, 
      statusUpdates: Object.values(groupedByUser) 
    });
  } catch (error) {
    console.error("Error fetching status updates:", error);
    res.status(500).json({ error: "Failed to fetch status updates" });
  }
});

router.get("/:statusId", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user!.uid;

    const statusDoc = await db.collection("status").doc(statusId).get();

    if (!statusDoc.exists) {
      return res.status(404).json({ error: "Status not found" });
    }

    const statusData = statusDoc.data();
    const now = new Date().toISOString();

    if (statusData && statusData.expiresAt < now) {
      return res.status(404).json({ error: "Status has expired" });
    }

    const userDoc = await db.collection("users").doc(statusData!.userId).get();
    const userData = userDoc.data();

    res.json({ 
      success: true, 
      status: {
        id: statusDoc.id,
        ...statusData,
        user: {
          id: statusData!.userId,
          displayName: userData?.displayName || "Unknown",
          photoURL: userData?.photoURL || "",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

router.post("/:statusId/view", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user!.uid;

    const statusDoc = await db.collection("status").doc(statusId).get();

    if (!statusDoc.exists) {
      return res.status(404).json({ error: "Status not found" });
    }

    const statusData = statusDoc.data();

    if (statusData && statusData.userId === userId) {
      return res.json({ success: true, message: "Cannot view own status" });
    }

    const viewers = statusData?.viewers || [];
    if (!viewers.includes(userId)) {
      await db.collection("status").doc(statusId).update({
        viewCount: (statusData?.viewCount || 0) + 1,
        viewers: [...viewers, userId],
      });

      await db
        .collection("status")
        .doc(statusId)
        .collection("views")
        .add({
          userId,
          viewedAt: new Date().toISOString(),
        });
    }

    res.json({ success: true, message: "Status viewed successfully" });
  } catch (error) {
    console.error("Error viewing status:", error);
    res.status(500).json({ error: "Failed to view status" });
  }
});

router.get("/:statusId/viewers", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user!.uid;

    const statusDoc = await db.collection("status").doc(statusId).get();

    if (!statusDoc.exists) {
      return res.status(404).json({ error: "Status not found" });
    }

    const statusData = statusDoc.data();

    if (statusData && statusData.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to view status viewers" });
    }

    const viewsSnapshot = await db
      .collection("status")
      .doc(statusId)
      .collection("views")
      .orderBy("viewedAt", "desc")
      .get();

    const viewers = await Promise.all(
      viewsSnapshot.docs.map(async (doc) => {
        const viewData = doc.data();
        const userDoc = await db.collection("users").doc(viewData.userId).get();
        const userData = userDoc.data();

        return {
          userId: viewData.userId,
          displayName: userData?.displayName || "Unknown",
          photoURL: userData?.photoURL || "",
          viewedAt: viewData.viewedAt,
        };
      })
    );

    res.json({ success: true, viewers });
  } catch (error) {
    console.error("Error fetching status viewers:", error);
    res.status(500).json({ error: "Failed to fetch status viewers" });
  }
});

router.delete("/:statusId", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user!.uid;

    const statusDoc = await db.collection("status").doc(statusId).get();

    if (!statusDoc.exists) {
      return res.status(404).json({ error: "Status not found" });
    }

    const statusData = statusDoc.data();

    if (statusData && statusData.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete status" });
    }

    await db.collection("status").doc(statusId).delete();

    res.json({ success: true, message: "Status deleted successfully" });
  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({ error: "Failed to delete status" });
  }
});

export default router;
