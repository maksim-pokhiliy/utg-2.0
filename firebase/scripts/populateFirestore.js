import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import path from "path";

import { PRODUCTS } from "../data.js";

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

const populateFirestore = async () => {
  try {
    for (const categoryKey in PRODUCTS) {
      const category = PRODUCTS[categoryKey];
      const categoryRef = db.collection("categories").doc(categoryKey);
      const categoryDoc = await categoryRef.get();

      if (!categoryDoc.exists) {
        await categoryRef.set({
          title: category.title,
          image: category.image,
        });

        console.log(`Category '${category.title}' added to Firestore.`);
      } else {
        console.log(`Category '${category.title}' already exists. Skipping...`);
      }

      for (const product of category.products) {
        const productsRef = categoryRef.collection("products");
        const productQuery = productsRef.where("title", "==", product.title);
        const productSnapshot = await productQuery.get();

        if (productSnapshot.empty) {
          await productsRef.add({
            title: product.title,
            description: product.description || "",
            image: product.image,
            sizes: product.sizes || [],
            price: product.price,
            availability: product.availability,
          });

          console.log(
            `Product '${product.title}' added to category '${category.title}'.`
          );
        } else {
          console.log(
            `Product '${product.title}' already exists in category '${category.title}'. Skipping...`
          );
        }
      }
    }

    console.log("Firestore population complete.");
  } catch (error) {
    console.error("Error populating Firestore:", error);
  }
};

populateFirestore();
