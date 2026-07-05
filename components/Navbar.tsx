"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase, signOut } from "@/utils/supabase";
import { isAdminUser } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Zap,
  LayoutDashboard,
  ShoppingBag,
  Server,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard#shop", label: "Shop", icon: ShoppingBag },
  { href: "/servers", label: "Server-Liste", icon: Server },
];

type NavbarProps = {
  initialIsAdmin?: boolean;
};

export default function Navbar({ initialIsAdmin = false }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const resolveAdminStatus = (currentUser: User | null) => {
    setIsAdmin(currentUser ? isAdminUser(currentUser) || initialIsAdmin : false);
  };

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);
      resolveAdminStatus(user ?? null);
    };

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAdmin(false);
        return;
      }
      if (session?.user) {
        setUser(session.user);
        resolveAdminStatus(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [initialIsAdmin]);

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
  };

  const userAvatarUrl =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const userDisplayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "User";
  const userInitials = userDisplayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/30 group-hover:neon-glow transition-all duration-300">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="neon-text">Loot</span>
            <span className="text-foreground">Drop</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                pathname.startsWith("/admin")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Shield className="h-4 w-4" />
              Mission Control
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border/50 pl-2 pr-3 py-1 hover:border-primary/40 hover:bg-white/5 transition-all duration-200 focus:outline-none">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={userAvatarUrl} alt={userDisplayName} />
                    <AvatarFallback className="text-xs bg-primary/20 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden sm:block max-w-24 truncate">
                    {userDisplayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Mission Control
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Ausloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="neon-glow hidden md:flex">
              <Link href="/login">Mit Discord einloggen</Link>
            </Button>
          )}

          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Navigation öffnen"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
              >
                <Shield className="h-4 w-4" />
                Mission Control
              </Link>
            )}
            {!user && (
              <Button asChild className="mt-2 neon-glow">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Mit Discord einloggen
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
