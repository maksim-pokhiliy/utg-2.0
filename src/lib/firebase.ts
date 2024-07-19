import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import path from "path";

if (!getApps().length) {
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
  });
}

export const db = getFirestore();
