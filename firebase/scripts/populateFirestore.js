import { PRODUCTS } from "../data.js";
import { db } from "../firebaseAdmin.js";

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
