import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const difficulty = searchParams.get("difficulty");
  const region = searchParams.get("region");
  const subRegion = searchParams.get("sub_region");
  const theme = searchParams.get("theme");

  const supabase = await createClient();

  let query = supabase
    .from("street_view_locations")
    .select("id", { count: "exact", head: true });

  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    query = query.eq("difficulty", difficulty);
  }
  if (region) query = query.eq("region", region);
  if (subRegion) query = query.eq("sub_region", subRegion);
  if (theme) query = query.eq("theme", theme);

  const { count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}
