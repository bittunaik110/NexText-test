import admin from 'firebase-admin';
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
    'Please add these variables using the Secrets tool in Replit.'
  );
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      databaseURL: "https://chatting-application-8180c-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    throw error;
  }
}

export const firebaseAdmin = admin;
export const auth = admin.auth();
export const db = admin.firestore();
export const realtimeDb = admin.database();
export const storage = admin.storage();