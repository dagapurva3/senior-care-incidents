import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

function initializeFirebase(customConfig?: any) {
    if (!admin.apps.length) {
        if (customConfig) {
            admin.initializeApp(customConfig);
        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                }),
            });
        } else {
            console.warn("Firebase credentials not provided. Authentication will be disabled.");
            admin.initializeApp({ projectId: "dummy-project" });
        }
    }
}

export function getFirebaseAdmin(customConfig?: any) {
    initializeFirebase(customConfig);
    return admin;
}
