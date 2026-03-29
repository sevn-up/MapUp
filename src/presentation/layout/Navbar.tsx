"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/presentation/providers/AuthProvider";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/country-shape", label: "Shape Quiz" },
  { href: "/name-all", label: "Name All" },
  { href: "/worldle", label: "Worldle" },
  { href: "/street-view", label: "Street View" },
];

export function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="pointer-events-none fixed top-0 left-0 right-0 z-50 border-b border-green/10 bg-navy/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="pointer-events-auto text-xl font-bold tracking-tight text-white"
          onClick={() => setMobileOpen(false)}
        >
          Map<span className="text-green">Up</span>
        </Link>

        {/* Desktop nav */}
        <div className="pointer-events-auto hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-green"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-green/10 border border-green/20"
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="pointer-events-auto flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-navy-lighter" />
          ) : user ? (
            <Link
              href="/profile"
              className={cn(
                "flex h-9 items-center gap-2 rounded-full border border-green/20 bg-navy-light px-4",
                "text-sm font-medium text-green-light transition-colors hover:bg-green/10"
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green text-xs font-bold text-navy">
                {user.email?.[0]?.toUpperCase() || "?"}
              </div>
              <span className="hidden sm:inline">Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                "hidden rounded-lg border border-green/30 bg-green/10 px-4 py-2 text-sm font-semibold text-green sm:block",
                "transition-all hover:bg-green/20 hover:border-green/50"
              )}
            >
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pointer-events-auto overflow-hidden border-t border-green/5 bg-navy/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium",
                    pathname === link.href
                      ? "bg-green/10 text-green"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!user && !loading && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 block rounded-lg bg-green text-navy px-3 py-2.5 text-center text-sm font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
