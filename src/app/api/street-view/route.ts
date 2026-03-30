import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_REGIONS = ["europe", "asia", "africa", "north_america", "south_america", "oceania"];
const VALID_THEMES = ["landmarks", "natural_wonders", "historic", "coastal", "urban", "rural"];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const difficulty = searchParams.get("difficulty");
  const region = searchParams.get("region");
  const subRegion = searchParams.get("sub_region");
  const theme = searchParams.get("theme");
  const count = parseInt(searchParams.get("count") || "5", 10);

  const supabase = await createClient();

  let query = supabase
    .from("street_view_locations")
    .select("id, lat, lng, country_code, difficulty, region, sub_region, theme, name");

  if (difficulty && VALID_DIFFICULTIES.includes(difficulty)) {
    query = query.eq("difficulty", difficulty);
  }

  if (region && VALID_REGIONS.includes(region)) {
    query = query.eq("region", region);
  }

  if (subRegion) {
    query = query.eq("sub_region", subRegion);
  }

  if (theme && VALID_THEMES.includes(theme)) {
    query = query.eq("theme", theme);
  }

  // Fetch all matching, shuffle client-side, return requested count
  const { data, error } = await query.limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return NextResponse.json(shuffled.slice(0, count));
}
