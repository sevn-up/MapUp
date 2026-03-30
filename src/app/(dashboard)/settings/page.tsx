"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/presentation/providers/AuthProvider";
import { useSupabase } from "@/presentation/providers/SupabaseProvider";
import { Button } from "@/presentation/ui/Button";
import { useGlobeStyle, GLOBE_STYLES, type GlobeStyle } from "@/application/useGlobeStyle";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

const STYLE_PREVIEWS: Record<GlobeStyle, { bg: string; description: string }> = {
  dark: { bg: "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]", description: "Subtle dark satellite" },
  blue: { bg: "bg-gradient-to-br from-[#1a4a6e] to-[#2d6a8f]", description: "Classic blue marble" },
  night: { bg: "bg-gradient-to-br from-[#0a0a1a] to-[#1a1a3e]", description: "City lights at night" },
  wireframe: { bg: "bg-gradient-to-br from-[#0a1929] to-[#0d2137]", description: "Minimal borders only" },
};

function GlobeStylePicker() {
  const { style, setStyle } = useGlobeStyle();

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">Globe Style</h2>
        <p className="text-xs text-slate-500">Choose how the 3D globe looks across the app</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GLOBE_STYLES.map((gs) => {
          const preview = STYLE_PREVIEWS[gs.id];
          const active = style === gs.id;
          return (
            <button
              key={gs.id}
              onClick={() => setStyle(gs.id)}
              className={cn(
                "group relative overflow-hidden rounded-xl border p-3 text-left transition-all",
                active
                  ? "border-green/40 bg-green/5 ring-1 ring-green/20"
                  : "border-white/5 bg-white/[0.02] hover:bg-white/5"
              )}
            >
              <div className={cn(
                "mb-2 h-16 rounded-lg flex items-center justify-center",
                preview.bg
              )}>
                {gs.texture ? (
                  <div className="text-2xl opacity-70">🌍</div>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-50">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                    <ellipse cx="20" cy="20" rx="8" ry="16" fill="none" stroke="#4ade80" strokeWidth="0.5" />
                    <line x1="4" y1="20" x2="36" y2="20" stroke="#4ade80" strokeWidth="0.5" />
                    <line x1="20" y1="4" x2="20" y2="36" stroke="#4ade80" strokeWidth="0.5" />
                  </svg>
                )}
              </div>
              <div className={cn(
                "text-sm font-semibold",
                active ? "text-green" : "text-slate-300"
              )}>
                {gs.label}
              </div>
              <div className="text-[10px] text-slate-500">{preview.description}</div>
              {active && (
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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

      {/* Globe Style */}
      <GlobeStylePicker />

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
