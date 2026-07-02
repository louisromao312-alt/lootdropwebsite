import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardClient from "./DashboardClient";

// Server-Component: Session prüfen und Daten laden
async function getSessionAndData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Session aus Cookie lesen (funktioniert nur mit @supabase/ssr in production)
  // Für jetzt: Client-seitiger Auth-Check via DashboardClient
  const { data: { session } } = await supabase.auth.getSession();

  return { session, supabase };
}

export default async function DashboardPage() {
  // Daten-Laden und Auth-Check erfolgen im Client-Component
  // (Supabase SSR würde @supabase/ssr benötigen — hier Client-Auth für Einfachheit)
  return <DashboardClient />;
}
