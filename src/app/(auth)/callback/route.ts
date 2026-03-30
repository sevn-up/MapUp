import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error_param = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/";

  console.log("[auth/callback] Starting callback handler");
  console.log("[auth/callback] Origin:", origin);
  console.log("[auth/callback] Code present:", !!code);
  console.log("[auth/callback] Error param:", error_param);
  console.log("[auth/callback] Error description:", error_description);
  console.log("[auth/callback] All params:", Object.fromEntries(searchParams.entries()));

  if (error_param) {
    console.log("[auth/callback] OAuth error from provider:", error_param, error_description);
    return NextResponse.redirect(`${origin}/login?error=${error_param}`);
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("[auth/callback] Supabase URL configured:", !!supabaseUrl);
    console.log("[auth/callback] Supabase key configured:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.log("[auth/callback] Missing Supabase config!");
      return NextResponse.redirect(`${origin}/login?error=config`);
    }

    const redirectUrl = `${origin}${next}`;
    console.log("[auth/callback] Will redirect to:", redirectUrl);

    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get("cookie") || "";
          const cookies = cookieHeader.split("; ").filter(Boolean).map((c) => {
            const [name, ...rest] = c.split("=");
            return { name, value: rest.join("=") };
          });
          console.log("[auth/callback] Incoming cookies:", cookies.length);
          return cookies;
        },
        setAll(cookiesToSet) {
          console.log("[auth/callback] Setting cookies:", cookiesToSet.length);
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log("[auth/callback] Setting cookie:", name, "length:", value.length);
            response.cookies.set(name, value, {
              ...options,
              // Ensure cookies work on Vercel
              sameSite: "lax",
              secure: true,
            });
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("[auth/callback] Exchange result - error:", error?.message ?? "none");
    console.log("[auth/callback] Exchange result - session:", !!data?.session);
    console.log("[auth/callback] Exchange result - user:", data?.session?.user?.email ?? "none");

    if (!error) {
      console.log("[auth/callback] Success! Redirecting to:", redirectUrl);
      console.log("[auth/callback] Response cookies:", response.cookies.getAll().map(c => c.name));
      return response;
    }

    console.log("[auth/callback] Exchange failed:", error.message);
  }

  console.log("[auth/callback] Falling through to error redirect");
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
