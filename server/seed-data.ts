
import { realtimeDb, db } from "./firebase-admin";
import { generateUniquePIN } from "./utils/pin-generator";

export async function seedDemoData() {
  console.log("Starting to seed demo data...");

  try {
    // Create demo users
    const demoUsers = [
      {
        uid: "demo-user-1",
        email: "alice@nextext.demo",
        displayName: "Alice Johnson",
        bio: "React developer passionate about building great UIs",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
      },
      {
        uid: "demo-user-2",
        email: "bob@nextext.demo",
        displayName: "Bob Smith",
        bio: "Backend engineer who loves system architecture",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      },
      {
        uid: "demo-user-3",
        email: "carol@nextext.demo",
        displayName: "Carol Williams",
        bio: "Product manager and design enthusiast",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
      },
    ];

    // Seed users to Firestore
    for (const user of demoUsers) {
      const checkPinExists = async (pin: string) => {
        const snapshot = await db.collection("users").where("pin", "==", pin).get();
        return !snapshot.empty;
      };

      const pin = await generateUniquePIN(checkPinExists);
      
      await db.collection("users").doc(user.uid).set({
        ...user,
        pin,
        createdAt: new Date().toISOString(),
      });
      
      console.log(`Created user: ${user.displayName} with PIN: ${pin}`);
    }

    // Create demo chats in Realtime Database
    const chats = [
      {
        chatId: "demo-chat-1",
        participants: ["demo-user-1", "demo-user-2"],
        lastMessage: "Hey! How's the project going?",
        lastMessageTime: new Date().toISOString(),
        unreadCount: { "demo-user-1": 0, "demo-user-2": 1 },
        deleted: false,
        participantNames: {
          "demo-user-1": "Alice Johnson",
          "demo-user-2": "Bob Smith",
        },
        participantPhotos: {
          "demo-user-1": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
          "demo-user-2": "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        },
      },
      {
        chatId: "demo-chat-2",
        participants: ["demo-user-1", "demo-user-3"],
        lastMessage: "Let's schedule a meeting for tomorrow",
        lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: { "demo-user-1": 2, "demo-user-3": 0 },
        deleted: false,
        participantNames: {
          "demo-user-1": "Alice Johnson",
          "demo-user-3": "Carol Williams",
        },
        participantPhotos: {
          "demo-user-1": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
          "demo-user-3": "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
        },
      },
    ];

    for (const chat of chats) {
      await realtimeDb.ref(`chats/${chat.chatId}`).set(chat);
      console.log(`Created chat: ${chat.chatId}`);
    }

    // Create demo messages
    const messages = [
      {
        chatId: "demo-chat-1",
        messageId: "msg-1",
        text: "Hi Bob! Just wanted to check in on the backend API",
        timestamp: Date.now() - 7200000,
        userId: "demo-user-1",
        deleted: false,
        status: "read",
        readBy: ["demo-user-1", "demo-user-2"],
      },
      {
        chatId: "demo-chat-1",
        messageId: "msg-2",
        text: "Hey Alice! It's going well. I've finished the authentication endpoints",
        timestamp: Date.now() - 3600000,
        userId: "demo-user-2",
        deleted: false,
        status: "read",
        readBy: ["demo-user-1", "demo-user-2"],
      },
      {
        chatId: "demo-chat-1",
        messageId: "msg-3",
        text: "Hey! How's the project going?",
        timestamp: Date.now() - 1800000,
        userId: "demo-user-2",
        deleted: false,
        status: "delivered",
        readBy: ["demo-user-2"],
      },
      {
        chatId: "demo-chat-2",
        messageId: "msg-4",
        text: "Hi Carol! How are you?",
        timestamp: Date.now() - 7200000,
        userId: "demo-user-1",
        deleted: false,
        status: "read",
        readBy: ["demo-user-1", "demo-user-3"],
      },
      {
        chatId: "demo-chat-2",
        messageId: "msg-5",
        text: "I'm great! Thanks for asking",
        timestamp: Date.now() - 5400000,
        userId: "demo-user-3",
        deleted: false,
        status: "read",
        readBy: ["demo-user-1", "demo-user-3"],
      },
      {
        chatId: "demo-chat-2",
        messageId: "msg-6",
        text: "Let's schedule a meeting for tomorrow",
        timestamp: Date.now() - 3600000,
        userId: "demo-user-3",
        deleted: false,
        status: "sent",
        readBy: ["demo-user-3"],
      },
    ];

    for (const message of messages) {
      await realtimeDb.ref(`messages/${message.chatId}/${message.messageId}`).set(message);
      console.log(`Created message: ${message.messageId} in ${message.chatId}`);
    }

    console.log("✅ Demo data seeded successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding demo data:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log("Seeding complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
