import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginClient supabaseConfigured={supabaseConfigured} />
    </Suspense>
  );
}
