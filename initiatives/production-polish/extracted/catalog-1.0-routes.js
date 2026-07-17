import Category from "../../pages/Category";
import Product from "../../pages/Product";
import Reports from "../../pages/Reports";
import About from "../../pages/About";

import { PRODUCT_AVAILABLE, PRODUCT_NOT_AVAILABLE } from "./common";

// t-shirts
import black1 from "../../assets/images/products/BLACK.jpg";
import black2 from "../../assets/images/products/BLACK1.jpg";
import green1 from "../../assets/images/products/GREEN.jpg";
import green2 from "../../assets/images/products/GREEN1.jpg";
import grey1 from "../../assets/images/products/GREY.jpg";
import grey2 from "../../assets/images/products/GREY1.jpg";

// patches
import waiting from "../../assets/images/products/patches_waiting.jpg";
import welcome from "../../assets/images/products/patches_welcome.jpg";
import withYou from "../../assets/images/products/patches_with_you.jpg";
import set from "../../assets/images/products/patches_set.jpg";
import utg from "../../assets/images/products/patches_utg.jpg";

// reports
import report1 from "../../assets/images/report_1.jpg";
import report2 from "../../assets/images/report_2.jpg";
import report3 from "../../assets/images/report_3.jpg";
import report4 from "../../assets/images/report_4.jpg";
import report5 from "../../assets/images/report_5.jpg";
import report6 from "../../assets/images/report_6.jpg";
import report7 from "../../assets/images/report_7.jpg";
import report8 from "../../assets/images/report_8.jpg";

// patches
import stickers2 from "../../assets/images/products/stickers2.JPG";

export const ROOT = "/";
export const COLLECTIONS = `${ROOT}collections${ROOT}`;
export const TSHIRTS = `${COLLECTIONS}tshirts${ROOT}`;
export const PATCHES = `${COLLECTIONS}patches${ROOT}`;
export const STICKERS = `${COLLECTIONS}stickers${ROOT}`;
export const PRODUCT = `${COLLECTIONS}:collectionId${ROOT}:productId${ROOT}`;
export const REPORTS = `${ROOT}reports${ROOT}`;
export const ABOUT = `${ROOT}about${ROOT}`;

export const PRODUCTS = {
  [TSHIRTS]: {
    image: black1,
    title: "T-Shirts",
    path: TSHIRTS,
    products: [
      {
        title: "«Death» Black",
        description: `Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "With you or for you it depends on how you trained" slogan and large graphic.`,
        image: black1,
        sizes: ["M", "L", "XL", "2XL"],
        path: `${TSHIRTS}black1${ROOT}`,
        price: 1000,
        availability: PRODUCT_NOT_AVAILABLE,
      },
      {
        title: "«Welcome» Black",
        description: `Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "Welcome to Ukraine, suka!" slogan and large graphic.`,
        image: black2,
        sizes: ["M", "L", "XL", "2XL"],
        path: `${TSHIRTS}black2${ROOT}`,
        price: 1000,
        availability: PRODUCT_NOT_AVAILABLE,
      },
      {
        title: "«Death» Green",
        description: `Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "With you or for you it depends on how you trained" slogan and large graphic.`,
        image: green1,
        sizes: ["M", "L", "XL", "2XL"],
        path: `${TSHIRTS}green1${ROOT}`,
        price: 1000,
        availability: PRODUCT_NOT_AVAILABLE,
      },
      {
        title: "«Welcome» Green",
        description: `Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "Welcome to Ukraine, suka!" slogan and large graphic.`,
        image: green2,
        sizes: ["M", "L", "XL", "2XL"],
        path: `${TSHIRTS}green2${ROOT}`,
        price: 1000,
        availability: PRODUCT_NOT_AVAILABLE,
      },
      {
        title: "«Death» Grey",
        description: `Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "With you or for you it depends on how you trained" slogan and large graphic.`,
        image: grey1,
        sizes: ["M", "L", "XL", "2XL"],
        path: `${TSHIRTS}grey1${ROOT}`,
        price: 1000,
        availability: PRODUCT_NOT_AVAILABLE,
      },
      {
        title: "«Welcome» Grey",
        description: `Small print on the left chest: Ukrainian Tactical Gear logo. Back print with "Welcome to Ukraine, suka!" slogan and large graphic.`,
        image: grey2,
        sizes: ["M", "L", "XL", "2XL"],
        path: `${TSHIRTS}grey2${ROOT}`,
        price: 1000,
        availability: PRODUCT_NOT_AVAILABLE,
      },
    ],
  },
  [PATCHES]: {
    image: utg,
    title: "Patches",
    path: PATCHES,
    products: [
      {
        title: "«Waiting»",
        image: waiting,
        path: `${PATCHES}patch_waiting${ROOT}`,
        price: 300,
        availability: PRODUCT_AVAILABLE,
      },
      {
        title: "«Welcome»",
        image: welcome,
        path: `${PATCHES}patch_welcome${ROOT}`,
        price: 300,
        availability: PRODUCT_AVAILABLE,
      },
      {
        title: "«Death»",
        image: withYou,
        path: `${PATCHES}patch_death${ROOT}`,
        price: 300,
        availability: PRODUCT_AVAILABLE,
      },
      {
        title: "«UTG»",
        image: utg,
        path: `${PATCHES}patch_utg${ROOT}`,
        price: 300,
        availability: PRODUCT_AVAILABLE,
      },
      {
        title: "Set of «Waiting, Welcome, Death»",
        image: set,
        path: `${PATCHES}patch_set${ROOT}`,
        price: 800,
        availability: PRODUCT_AVAILABLE,
      },
    ],
  },
  [STICKERS]: {
    image: stickers2,
    title: "Stickers",
    path: STICKERS,
    products: [
      {
        title: "«Sticker Pack»",
        image: stickers2,
        path: `${STICKERS}sticker_utg${ROOT}`,
        price: 250,
        availability: PRODUCT_AVAILABLE,
      },
    ],
  },
};

export const PUBLIC_ROUTES = {
  [ROOT]: {
    title: "All categories",
    component: Category,
    path: ROOT,
    products: Object.values(PRODUCTS).map((product) => ({
      image: product.image,
      title: product.title,
      path: product.path,
    })),
  },
  [TSHIRTS]: {
    title: "T-Shirts",
    component: Category,
    path: TSHIRTS,
    products: PRODUCTS[TSHIRTS].products,
  },
  [PATCHES]: {
    title: "Patches",
    component: Category,
    path: PATCHES,
    products: PRODUCTS[PATCHES].products,
  },
  [STICKERS]: {
    title: "Stickers",
    component: Category,
    path: STICKERS,
    products: PRODUCTS[STICKERS].products,
  },
  [PRODUCT]: { component: Product, path: PRODUCT },
  [REPORTS]: {
    title: "Reports",
    component: Reports,
    path: REPORTS,
    reports: [
      { image: report1 },
      { image: report2 },
      {
        image: report3,
        title: "For material for the manufacture of initiators for FPV",
      },
      { image: report4 },
      { image: report5 },
      { image: report6 },
      { image: report7 },
      { image: report8 },
    ],
  },
  [ABOUT]: { title: "About the project", component: About, path: ABOUT },
};
