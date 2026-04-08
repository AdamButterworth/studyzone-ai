import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile (returning vs new user)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (profile) {
          // Returning user — go to app
          return NextResponse.redirect(`${origin}/app`);
        } else {
          // New user — go to onboarding
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }
    }
  }

  // Something went wrong — back to login
  return NextResponse.redirect(`${origin}/login`);
}
