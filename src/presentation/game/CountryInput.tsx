"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { countries } from "@/domain/countries";
import { cn } from "@/lib/utils/cn";

interface CountryInputProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  excludeCodes?: string[];
  className?: string;
}

interface MatchedCountry {
  code: string;
  name: string;
  flag: string;
  continent: string;
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return true;
  // Check if query chars appear in order
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function scoreMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  return 30; // fuzzy match
}

export function CountryInput({
  onSubmit,
  placeholder = "Type a country name...",
  disabled = false,
  autoFocus = true,
  excludeCodes = [],
  className,
}: CountryInputProps) {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const excludeSet = useMemo(() => new Set(excludeCodes), [excludeCodes]);

  const filtered = useMemo((): MatchedCountry[] => {
    if (!value.trim()) return [];

    const query = value.trim();
    const matches: (MatchedCountry & { score: number })[] = [];

    for (const c of countries) {
      if (excludeSet.has(c.code)) continue;

      // Check main name
      let matched = false;
      let bestScore = 0;

      if (fuzzyMatch(query, c.name)) {
        matched = true;
        bestScore = scoreMatch(query, c.name);
      }

      // Check alternate names
      if (!matched) {
        for (const alt of c.alternateNames) {
          if (fuzzyMatch(query, alt)) {
            matched = true;
            bestScore = Math.max(bestScore, scoreMatch(query, alt));
            break;
          }
        }
      }

      if (matched) {
        matches.push({
          code: c.code,
          name: c.name,
          flag: c.flag,
          continent: c.continent,
          score: bestScore,
        });
      }
    }

    // Sort by score descending, then name alphabetically
    matches.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    return matches.slice(0, 8);
  }, [value, excludeSet]);

  // Reset selection when input value changes (not when filtered list updates)
  useEffect(() => {
    setSelectedIndex(0);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const item = listRef.current.children[selectedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, isOpen]);

  const submitCountry = useCallback(
    (name: string) => {
      onSubmit(name);
      setValue("");
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || filtered.length === 0) {
        if (e.key === "Enter" && value.trim()) {
          e.preventDefault();
          submitCountry(value.trim());
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            submitCountry(filtered[selectedIndex].name);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, filtered, selectedIndex, submitCountry, value]
  );

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => value.trim() && setIsOpen(true)}
        onBlur={() => {
          // Delay to allow click on dropdown item
          setTimeout(() => setIsOpen(false), 200);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={cn(
          "w-full rounded-xl border border-green/20 bg-navy px-4 py-3 text-lg text-white",
          "placeholder:text-slate-600",
          "transition-all focus:border-green focus:shadow-[0_0_15px_rgba(0,230,118,0.1)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && filtered.length > 0 && "rounded-b-none border-b-0"
        )}
      />

      {/* Dropdown */}
      {isOpen && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute inset-x-0 top-full z-50 max-h-[280px] overflow-y-auto rounded-b-xl border border-t-0 border-green/20 bg-navy"
        >
          {filtered.map((country, i) => (
            <button
              key={country.code}
              type="button"
              onPointerDown={(e) => {
                // preventDefault stops the input from blurring before the
                // tap completes. PointerEvents unify mouse + touch so a
                // single handler covers both desktop and mobile.
                e.preventDefault();
                submitCountry(country.name);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "flex min-h-[44px] w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                i === selectedIndex
                  ? "bg-green/10 text-white"
                  : "text-slate-300 hover:bg-green/5"
              )}
            >
              <span className="text-lg">{country.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {country.name}
                </div>
              </div>
              <span className="text-xs text-slate-600">{country.continent}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
