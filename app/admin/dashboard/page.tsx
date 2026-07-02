import {
  isAdminUser,
  getDiscordUsername,
} from "@/lib/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import AdminDashboardGate from "./AdminDashboardGate";

export const metadata = {
  title: "LootDrop Admin — Mission Control",
  description: "Admin-Dashboard zur Überwachung von Plugin, Bot und Economy.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server-Session vorhanden und Admin → direkt rendern
  if (user && isAdminUser(user)) {
    const adminLabel =
      getDiscordUsername(user) ?? user.email ?? user.id.slice(0, 8);
    return <AdminDashboardClient adminLabel={adminLabel} />;
  }

  // Kein Server-User oder noch nicht als Admin erkannt → Client-Gate prüft per Browser-Session
  return <AdminDashboardGate />;
}
