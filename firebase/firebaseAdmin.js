import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";

dotenv.config({ path: ".env.local" });

const serviceAccount = JSON.parse(
  readFileSync(
    path.resolve(
      process.cwd(),
      "firebase/ukrainian-tactical-gear-firebase-adminsdk.json"
    ),
    "utf8"
  )
);

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore();

db.settings({ ignoreUndefinedProperties: true });

export { db };
