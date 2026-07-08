"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase, signOut } from "@/utils/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard, Shield, Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/affiliate", label: "Affiliate" },
  { href: "/faq", label: "FAQ" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/partner", label: "Partner werden" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(event === "SIGNED_OUT" ? null : (session?.user ?? null));
    });
    return () => subscription.unsubscribe();
  }, []);

  const userDisplayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.user_metadata?.user_name ??
    user?.email?.split("@")[0] ??
    "User";

  const userAvatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 group" onClick={() => setMobileOpen(false)}>
          <span className="text-2xl font-black tracking-tight uppercase leading-none">
            Loot<span className="text-primary">Drop</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-foreground bg-black/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/admin"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname.startsWith("/admin")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-black/5"
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Right: CTA / User */}
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-full border border-border pl-2 pr-3 py-1.5 hover:bg-black/5 transition-colors focus:outline-none">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={userAvatarUrl} alt={userDisplayName} />
                    <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                      {userDisplayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold hidden sm:block max-w-28 truncate">
                    {userDisplayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border border-border">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 font-medium">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2 font-medium">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive flex items-center gap-2 font-medium cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="btn-cta text-sm py-2.5 px-5 hidden sm:inline-flex">
              LOGIN
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 pb-5 pt-3">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
            >
              Admin
            </Link>
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-cta mt-2 justify-center"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
