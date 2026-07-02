import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarShell from "@/components/NavbarShell";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LootDrop — Dein Gameplay. Echte Rewards.",
  description:
    "Die B2B Gaming Loyalty Plattform. Verdiene LootCoins auf deinem Minecraft-Server und löse sie gegen echte Rewards ein.",
  keywords: ["Minecraft", "Gaming", "Loyalty", "Rewards", "Discord"],
  openGraph: {
    title: "LootDrop",
    description: "Dein Gameplay. Echte Rewards.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <NavbarShell />
        <main className="flex-1">{children}</main>
        <Toaster position="bottom-right" theme="dark" />
        <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
          <div className="mx-auto max-w-7xl px-4">
            © {new Date().getFullYear()} LootDrop — Die Gaming Loyalty Plattform
          </div>
        </footer>
      </body>
    </html>
  );
}
