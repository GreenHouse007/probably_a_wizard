import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameShell } from "@/components/game/game-shell";

export const metadata: Metadata = {
  title: "Probably a Wizard",
  description: "Idle + alchemy style manager discovery game",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Probably a Wizard",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#15102a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GameShell>{children}</GameShell>
      </body>
    </html>
  );
}
