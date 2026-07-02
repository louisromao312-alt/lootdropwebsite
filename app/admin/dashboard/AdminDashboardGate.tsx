"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import {
  isAdminUserClient,
  getDiscordIdentityCandidates,
  getAdminDiscordUsernames,
  getDiscordUsername,
} from "@/lib/admin";
import { checkAdminAccess } from "./actions";
import AdminDashboardClient from "./AdminDashboardClient";
import AdminAccessDenied from "./AdminAccessDenied";
import { Loader2 } from "lucide-react";

/**
 * Client-Fallback: Prüft Admin-Zugang über Browser-Session + Server Action.
 * Nötig wenn die Server-Session auf Vercel beim ersten Render noch fehlt.
 */
export default function AdminDashboardGate() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "admin" | "denied" | "login">("loading");
  const [adminLabel, setAdminLabel] = useState("Admin");
  const [detectedIdentities, setDetectedIdentities] = useState<string[]>([]);

  useEffect(() => {
    const verify = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState("login");
        router.replace("/login");
        return;
      }

      setDetectedIdentities(getDiscordIdentityCandidates(user));

      let isAdmin = isAdminUserClient(user);

      try {
        const { isAdmin: serverAdmin } = await checkAdminAccess();
        isAdmin = isAdmin || serverAdmin;
      } catch {
        // Server-Action fehlgeschlagen – Client-Check reicht
      }

      if (isAdmin) {
        setAdminLabel(getDiscordUsername(user) ?? user.email ?? "Admin");
        setState("admin");
        return;
      }

      setState("denied");
    };

    void verify();
  }, [router]);

  if (state === "loading" || state === "login") {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Admin-Zugang wird geprüft…</span>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <AdminAccessDenied
        detectedIdentities={detectedIdentities}
        expectedAdmins={getAdminDiscordUsernames()}
      />
    );
  }

  return <AdminDashboardClient adminLabel={adminLabel} />;
}
