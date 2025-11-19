
import { Router } from "express";
import { db } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/create", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description, memberIds, avatar } = req.body;
    const userId = req.user!.uid;

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: "Name and member IDs are required" });
    }

    const groupData = {
      name,
      description: description || "",
      avatar: avatar || "",
      createdBy: userId,
      createdAt: new Date().toISOString(),
      members: {
        [userId]: { role: "admin", joinedAt: new Date().toISOString() }
      },
      settings: {
        onlyAdminsCanSend: false,
        allowMediaSharing: true,
        allowMemberInvites: true
      },
      lastMessage: "",
      lastMessageTime: new Date().toISOString()
    };

    memberIds.forEach((memberId: string) => {
      if (memberId !== userId) {
        groupData.members[memberId] = { role: "member", joinedAt: new Date().toISOString() };
      }
    });

    const groupRef = await db.collection("groups").add(groupData);

    res.json({ groupId: groupRef.id, group: groupData });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
});

router.get("/list", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;

    const groupsSnapshot = await db
      .collection("groups")
      .where(`members.${userId}`, "!=", null)
      .orderBy("lastMessageTime", "desc")
      .get();

    const groups = groupsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

router.post("/:groupId/members", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user!.uid;

    const groupDoc = await db.collection("groups").doc(groupId).get();
    
    if (!groupDoc.exists) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupData = groupDoc.data();
    const userRole = groupData?.members?.[userId]?.role;

    if (userRole !== "admin") {
      return res.status(403).json({ error: "Only admins can add members" });
    }

    const updates: any = {};
    memberIds.forEach((memberId: string) => {
      updates[`members.${memberId}`] = { role: "member", joinedAt: new Date().toISOString() };
    });

    await db.collection("groups").doc(groupId).update(updates);

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ error: "Failed to add members" });
  }
});

router.delete("/:groupId/members/:memberId", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user!.uid;

    const groupDoc = await db.collection("groups").doc(groupId).get();
    
    if (!groupDoc.exists) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupData = groupDoc.data();
    const userRole = groupData?.members?.[userId]?.role;

    if (userRole !== "admin" && userId !== memberId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.collection("groups").doc(groupId).update({
      [`members.${memberId}`]: null
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

router.put("/:groupId/settings", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { groupId } = req.params;
    const { settings } = req.body;
    const userId = req.user!.uid;

    const groupDoc = await db.collection("groups").doc(groupId).get();
    
    if (!groupDoc.exists) {
      return res.status(404).json({ error: "Group not found" });
    }

    const groupData = groupDoc.data();
    const userRole = groupData?.members?.[userId]?.role;

    if (userRole !== "admin") {
      return res.status(403).json({ error: "Only admins can update settings" });
    }

    await db.collection("groups").doc(groupId).update({
      settings: { ...groupData?.settings, ...settings }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
