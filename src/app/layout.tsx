import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameShell } from "@/components/game/game-shell";

export const metadata: Metadata = {
  title: "Probably A Wizard - MVP",
  description: "Idle + alchemy style manager discovery game",
  manifest: "/manifest.json",
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
