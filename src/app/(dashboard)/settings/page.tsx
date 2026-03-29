"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/presentation/providers/AuthProvider";
import { useSupabase } from "@/presentation/providers/SupabaseProvider";
import { Button } from "@/presentation/ui/Button";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useSupabase();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", user!.id)
        .single();

      if (data) {
        setUsername(data.username || "");
        setDisplayName(data.display_name || "");
      }
    }
    loadProfile();
  }, [user, authLoading, supabase, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        username: username.trim(),
      })
      .eq("id", user.id);

    if (error) {
      setError(error.message.includes("unique") ? "Username already taken" : error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green/30 border-t-green" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account</p>
      </div>

      {/* Profile settings */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-green/60">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="w-full rounded-lg border border-green/15 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-green"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-green/60">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            required
            className="w-full rounded-lg border border-green/15 bg-navy px-4 py-3 text-white placeholder:text-slate-600 focus:border-green"
          />
        </div>

        {error && <p className="text-sm text-wrong">{error}</p>}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </form>

      {/* Account info */}
      <div className="rounded-xl border border-white/5 bg-navy-card p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Email
        </div>
        <div className="mt-1 text-sm text-white">{user?.email || "—"}</div>
      </div>

      {/* Sign out */}
      <div className="border-t border-white/5 pt-6">
        <Button onClick={handleSignOut} variant="danger" className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
