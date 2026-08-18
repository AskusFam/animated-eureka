import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RallyUp — group trips, handled by text",
  description: "RallyUp is the travel concierge that lives in your texts.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryrallyup.com"),
  openGraph: {
    title: "RallyUp — group trips, handled by text",
    description: "Tell RallyUp where you want to go. It gets the group aligned and keeps the plan moving.",
    url: "/",
    siteName: "RallyUp",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "RallyUp — trips, handled by text" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RallyUp — group trips, handled by text",
    description: "A travel concierge that lives in your texts.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
