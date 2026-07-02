import { redirect } from "next/navigation";
import { isAdminUser, getDiscordUsername } from "@/lib/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = {
  title: "LootDrop Admin — Mission Control",
  description: "Admin-Dashboard zur Überwachung von Plugin, Bot und Economy.",
};

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminUser(user)) {
    redirect("/dashboard");
  }

  const adminLabel =
    getDiscordUsername(user) ?? user.email ?? user.id.slice(0, 8);

  return <AdminDashboardClient adminLabel={adminLabel} />;
}
