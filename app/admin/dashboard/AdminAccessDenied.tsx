import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";

type AdminAccessDeniedProps = {
  detectedIdentities: string[];
  expectedAdmins: string[];
};

export default function AdminAccessDenied({
  detectedIdentities,
  expectedAdmins,
}: AdminAccessDeniedProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card className="border-yellow-500/30 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-yellow-400" />
            Kein Admin-Zugang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Du bist eingeloggt, aber dein Account ist nicht als Administrator freigeschaltet.</p>

          <div className="rounded-md border border-border/50 bg-background/50 p-3 space-y-2">
            <p className="font-medium text-foreground">Erkannt von Discord:</p>
            {detectedIdentities.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
                {detectedIdentities.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs">Keine Discord-Identität gefunden.</p>
            )}
          </div>

          <div className="rounded-md border border-border/50 bg-background/50 p-3 space-y-1">
            <p className="font-medium text-foreground">Erwartete Admins (ENV):</p>
            <p className="font-mono text-xs">
              {expectedAdmins.length > 0 ? expectedAdmins.join(", ") : "— nicht konfiguriert —"}
            </p>
          </div>

          <p className="text-xs">
            Trage deinen exakten Discord-Namen in{" "}
            <code className="text-primary">ADMIN_DISCORD_USERNAMES</code> ein (lokal + Vercel),
            dann Dev-Server neu starten bzw. redeployen.
          </p>

          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zum Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
