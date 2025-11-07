import { Router } from "express";
import { db } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";
import { generateUniquePIN } from "../utils/pin-generator";

const router = Router();

router.post("/profile", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { displayName, bio, photoURL } = req.body;
    const userId = req.user!.uid;

    const checkPinExists = async (pin: string) => {
      const snapshot = await db.collection("users").where("pin", "==", pin).get();
      return !snapshot.empty;
    };

    const pin = await generateUniquePIN(checkPinExists);

    const userData = {
      email: req.user!.email,
      displayName: displayName || req.user!.email?.split("@")[0],
      bio: bio || "",
      photoURL: photoURL || "",
      pin,
      createdAt: new Date().toISOString(),
    };

    await db.collection("users").doc(userId).set(userData);

    res.json({ success: true, user: { ...userData, id: userId } });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Failed to create profile" });
  }
});

router.get("/profile", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ user: { id: userId, ...userDoc.data() } });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/profile", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.uid;
    const { displayName, bio, photoURL } = req.body;

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    await db.collection("users").doc(userId).update(updateData);

    const updatedDoc = await db.collection("users").doc(userId).get();
    res.json({ success: true, user: { id: userId, ...updatedDoc.data() } });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/by-pin/:pin", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { pin } = req.params;

    const snapshot = await db.collection("users").where("pin", "==", pin).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    res.json({
      user: {
        id: userDoc.id,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        bio: userData.bio,
      },
    });
  } catch (error) {
    console.error("Error finding user by PIN:", error);
    res.status(500).json({ error: "Failed to find user" });
  }
});

export default router;
