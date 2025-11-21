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
  const errorMsg = `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
    'Please add these variables using the Secrets tool in Replit.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    
    if (!privateKey || !privateKey.includes('BEGIN PRIVATE KEY')) {
      throw new Error('FIREBASE_PRIVATE_KEY is malformed. It should include the complete private key with BEGIN and END markers.');
    }

    const credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    });

    admin.initializeApp({
      credential: credential,
      databaseURL: "https://chatting-application-8180c-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
    
    console.log("Firebase Admin SDK initialized successfully");
    console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    console.error("Please verify your Firebase credentials in the Secrets tool");
    throw error;
  }
}

export const firebaseAdmin = admin;
export const auth = admin.auth();
export const db = admin.firestore();
export const realtimeDb = admin.database();
export const storage = admin.storage();