import admin from "firebase-admin";

export class FirebaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseConfigError";
  }
}

let firestore: admin.firestore.Firestore | null = null;

export const getDb = (): admin.firestore.Firestore => {
  if (firestore) {
    return firestore;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new FirebaseConfigError(
      "Firebase Admin credentials are not configured"
    );
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, "\n"),
        clientEmail,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  firestore = admin.firestore();

  return firestore;
};
