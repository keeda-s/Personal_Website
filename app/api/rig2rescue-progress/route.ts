import { NextResponse } from "next/server"

// Build progress for Rig2Rescue, read from its GitHub repository.
// Needs RIG2RESCUE_REPO ("owner/name"). Add GITHUB_TOKEN (read-only) if the repo is private.
export const revalidate = 3600

type Commit = { commit: { message: string; author: { date: string } } }

export async function GET() {
  const repo = process.env.RIG2RESCUE_REPO
  if (!repo) {
    return NextResponse.json({ error: "Rig2Rescue progress is not configured." }, { status: 501 })
  }

  const headers: HeadersInit = { Accept: "application/vnd.github+json" }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const response = await fetch(
      `https://api.github.com/repos/${repo}/commits?since=${since}&per_page=100`,
      { headers, next: { revalidate: 3600 } },
    )
    if (!response.ok) throw new Error(`GitHub responded ${response.status}`)

    const commits = (await response.json()) as Commit[]
    const latest = commits[0]

    return NextResponse.json({
      commitsLast30Days: commits.length,
      lastUpdate: latest?.commit.author.date ?? null,
      latestChange: latest?.commit.message.split("\n")[0] ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch Rig2Rescue progress."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
