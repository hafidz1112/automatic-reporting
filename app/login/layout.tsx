import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — Pertamina Retail Sales Report",
  description: "Masuk ke sistem pelaporan harian operasional Non-Fuel Retail Pertamina.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
