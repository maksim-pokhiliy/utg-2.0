import { Metadata } from "next";

import AboutScreen from "@root/components/pages/AboutScreen";

export const metadata: Metadata = {
  title: "UTG | About Us",
  description: "Donate and fight with us",
};

export default function About() {
  return <AboutScreen />;
}
