import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trip Concierge",
  description: "A text-first concierge for planning trips with your group.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
