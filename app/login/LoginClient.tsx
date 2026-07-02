"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, ArrowLeft, Loader2 } from "lucide-react";

const CONFIG_ERROR =
  "Supabase nicht konfiguriert. Setze NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY (lokal: .env.local, Vercel: Environment Variables).";

type LoginClientProps = {
  supabaseConfigured: boolean;
};

export default function LoginClient({ supabaseConfigured }: LoginClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackError = searchParams.get("error");
    if (callbackError) {
      const messages: Record<string, string> = {
        auth_callback_failed: "Discord-Login fehlgeschlagen. Bitte erneut versuchen.",
        supabase_not_configured: CONFIG_ERROR,
      };
      setError(
        messages[callbackError] ?? decodeURIComponent(callbackError)
      );
    }
  }, [searchParams]);

  const handleDiscordLogin = () => {
    setLoading(true);
    setError(null);
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 relative">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.75 0.22 142 / 20%) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.75 0.22 142 / 20%) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück zur Startseite
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/30 neon-glow">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">
              <span className="neon-text">Loot</span>
              <span>Drop</span>
            </div>
            <div className="text-xs text-muted-foreground">Gaming Loyalty</div>
          </div>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Willkommen zurück</CardTitle>
            <CardDescription>
              Verbinde deinen Discord-Account, um auf dein Dashboard zuzugreifen
              und deine LootCoins zu verwalten.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {!supabaseConfigured && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
                {CONFIG_ERROR}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              onClick={handleDiscordLogin}
              disabled={loading || !supabaseConfigured}
              size="lg"
              className="w-full h-12 text-base neon-glow relative overflow-hidden group"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verbinde mit Discord...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2.5 h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.133 18.112a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  Mit Discord einloggen
                </>
              )}
            </Button>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  Wir nutzen ausschließlich Discord OAuth — dein Passwort wird
                  niemals gespeichert.
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>
                  Dein LootCoins-Guthaben ist automatisch mit deiner Discord-ID
                  verknüpft.
                </span>
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">
                  noch kein Konto?
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Registriere dich auf einem unserer{" "}
              <Link
                href="/servers"
                className="text-primary hover:underline underline-offset-4"
              >
                Partner-Server
              </Link>{" "}
              und starte automatisch mit dem Sammeln.
            </div>

            <Badge
              variant="outline"
              className="w-full justify-center py-2 border-primary/20 text-muted-foreground text-xs"
            >
              Verschlüsselt via Supabase Auth · DSGVO-konform
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
