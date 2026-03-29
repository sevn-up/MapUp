"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http") &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!supabaseConfigured) {
      // Guest mode — just redirect home
      router.push("/");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleGuestPlay() {
    router.push("/");
  }

  async function handleGoogleLogin() {
    if (!supabaseConfigured) {
      router.push("/");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/callback` },
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to track your scores and compete with friends
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-green/15 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-green"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border border-green/15 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-green"
            />
          </div>

          {error && <p className="text-sm text-wrong">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-green/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-navy-light px-2 text-slate-600">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={handleGoogleLogin}
            className="w-full"
          >
            Continue with Google
          </Button>

          <Button
            variant="ghost"
            onClick={handleGuestPlay}
            className="w-full text-slate-400"
          >
            Play as Guest
          </Button>
        </div>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-green hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
