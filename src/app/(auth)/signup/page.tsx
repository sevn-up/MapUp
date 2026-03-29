"use client";

import { useState } from "react";
import { useSupabase } from "@/presentation/providers/SupabaseProvider";
import { Button } from "@/presentation/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http") &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!supabaseConfigured) {
      router.push("/");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Join MapUp and start your geography journey
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full rounded-lg border border-green/15 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-green"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-lg border border-green/15 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-green"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              className="w-full rounded-lg border border-green/15 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-green"
            />
          </div>

          {error && <p className="text-sm text-wrong">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-green hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
