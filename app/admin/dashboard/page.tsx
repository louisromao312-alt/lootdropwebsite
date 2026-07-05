import { isSupabaseConfigured } from "@/lib/supabase/config";
import { redirect } from "next/navigation";
import AdminDashboardGate from "./AdminDashboardGate";

export const metadata = {
  title: "LootDrop Admin — Mission Control",
  description: "Admin-Dashboard zur Überwachung von Plugin, Bot und Economy.",
};

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  return <AdminDashboardGate />;
}
