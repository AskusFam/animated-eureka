import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rally — group trips, handled by text",
  description: "A text-first concierge for planning trips with your group.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://trip-concierge-henna.vercel.app"),
  openGraph: {
    title: "Rally — group trips, handled by text",
    description: "Tell Rally where you want to go. It gets the group aligned and keeps the plan moving.",
    url: "/",
    siteName: "Rally",
    type: "website",
    images: [{ url: "/rally-logo.png", width: 1600, height: 440, alt: "Rally — trips, handled" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rally — group trips, handled by text",
    description: "A travel concierge that lives in your texts.",
    images: ["/rally-logo.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
