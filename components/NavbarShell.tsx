import { createServerSupabase } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";
import Navbar from "./Navbar";

export const dynamic = "force-dynamic";

export default async function NavbarShell() {
  let initialIsAdmin = false;

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    initialIsAdmin = isAdminUser(user);
  } catch {
    initialIsAdmin = false;
  }

  return <Navbar initialIsAdmin={initialIsAdmin} />;
}
