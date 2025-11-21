import { Router } from "express";
import { db } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";
import { generateUniquePIN } from "../utils/pin-generator";

const router = Router();

router.post("/profile", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { displayName, bio, photoURL } = req.body;
    const userId = req.user!.uid;

    // Check if profile already exists
    const existingUser = await db.collection("users").doc(userId).get();
    if (existingUser.exists) {
      return res.json({ success: true, user: { id: userId, ...existingUser.data() } });
    }

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

    const userData = userDoc.data();
    
    // Ensure PIN exists, generate if missing
    if (!userData?.pin) {
      const checkPinExists = async (pin: string) => {
        const snapshot = await db.collection("users").where("pin", "==", pin).get();
        return !snapshot.empty;
      };
      
      const pin = await generateUniquePIN(checkPinExists);
      await db.collection("users").doc(userId).update({ pin });
      userData!.pin = pin;
    }

    res.json({ user: { id: userId, ...userData } });
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

router.post("/contacts/add-by-pin", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { pin } = req.body;
    const currentUserId = req.user!.uid;

    if (!pin || pin.length !== 6) {
      return res.status(400).json({ error: "Invalid PIN format" });
    }

    // Find user by PIN
    const snapshot = await db.collection("users").where("pin", "==", pin.toUpperCase()).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "No user found with this PIN" });
    }

    const contactDoc = snapshot.docs[0];
    const contactId = contactDoc.id;

    // Can't add yourself
    if (contactId === currentUserId) {
      return res.status(400).json({ error: "You cannot add yourself as a contact" });
    }

    const contactData = contactDoc.data();

    // Check if contact already exists
    const existingContactRef = db
      .collection("users")
      .doc(currentUserId)
      .collection("contacts")
      .doc(contactId);

    const existingContact = await existingContactRef.get();
    if (existingContact.exists) {
      return res.status(400).json({ error: "Contact already added" });
    }

    // Add contact to current user's contacts
    await existingContactRef.set({
      userId: contactId,
      displayName: contactData.displayName,
      photoURL: contactData.photoURL || "",
      bio: contactData.bio || "",
      addedAt: new Date().toISOString(),
    });

    // Add current user to contact's contacts (bidirectional)
    const currentUserDoc = await db.collection("users").doc(currentUserId).get();
    const currentUserData = currentUserDoc.data();

    await db
      .collection("users")
      .doc(contactId)
      .collection("contacts")
      .doc(currentUserId)
      .set({
        userId: currentUserId,
        displayName: currentUserData?.displayName || "",
        photoURL: currentUserData?.photoURL || "",
        bio: currentUserData?.bio || "",
        addedAt: new Date().toISOString(),
      });

    res.json({
      success: true,
      contact: {
        id: contactId,
        displayName: contactData.displayName,
        photoURL: contactData.photoURL,
        bio: contactData.bio,
      },
    });
  } catch (error) {
    console.error("Error adding contact by PIN:", error);
    res.status(500).json({ error: "Failed to add contact" });
  }
});

export default router;
