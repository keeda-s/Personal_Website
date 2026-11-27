import type { ProjectStatus } from "@/lib/projects"

const dotColor: Record<ProjectStatus, string> = {
  Live: "bg-emerald-400",
  "In development": "bg-amber-300",
  "Coming soon": "bg-white/50",
}

export function StatusChip({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs text-white/85">
      <span className={`size-1.5 rounded-full ${dotColor[status]}`} aria-hidden="true" />
      {status}
    </span>
  )
}
