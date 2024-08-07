import { Metadata } from "next";

import ReportsScreen from "@root/components/pages/ReportsScreen";

export const metadata: Metadata = {
  title: "UTG | Reports",
  description: "Donate and fight with us",
};

export default function Reports() {
  return <ReportsScreen />;
}
