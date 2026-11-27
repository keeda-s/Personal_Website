import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Live Looksy usage, read from the Looksy Supabase project.
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only;
// the tables use row level security, so the anon key reads nothing).
export const revalidate = 3600

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: "Looksy stats are not configured." }, { status: 501 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  try {
    const { data, error } = await supabase
      .from("user_searches")
      .select("meta_user_id, products_detected")
      .range(0, 49999)

    if (error) throw error

    const rows = data ?? []
    const people = new Set(rows.map((row) => row.meta_user_id).filter(Boolean)).size
    const productsSpotted = rows.reduce((sum, row) => sum + (row.products_detected ?? 0), 0)

    return NextResponse.json({
      searches: rows.length,
      people,
      productsSpotted,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch Looksy stats."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
