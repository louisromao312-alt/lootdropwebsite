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
  title: "LootDrop — Level Up, Earn Real Rewards.",
  description:
    "Verdiene LootCoins auf deinen Lieblingsservern und löse sie gegen echte Belohnungen ein. Die Gaming Loyalty Plattform für Minecraft.",
  keywords: ["Minecraft", "Gaming", "Loyalty", "Rewards", "Discord", "LootCoins"],
  openGraph: {
    title: "LootDrop — Level Up, Earn Real Rewards.",
    description: "Verdiene LootCoins auf deinen Lieblingsservern.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <NavbarShell />
        <main className="flex-1">{children}</main>
        <Toaster position="bottom-right" />
        <footer className="border-t border-border py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight uppercase">LootDrop</span>
              <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">
                Gaming Loyalty
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LootDrop. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <a href="/faq" className="hover:text-foreground transition-colors">FAQ</a>
              <a href="/affiliate" className="hover:text-foreground transition-colors">Affiliate</a>
              <a href="/partner" className="hover:text-foreground transition-colors">Partner</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
