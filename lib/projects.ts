// Single source of truth for the projects shown as stars and in "My work".
// Edit the copy here; the sky, the bento and the work list all read from it.

export type ProjectStatus = "Live" | "In development" | "Coming soon"

export type ProjectLink = {
  label: string
  href: string
}

export type Project = {
  slug: string
  name: string
  /** One-line pitch shown on hover and in the work list. */
  tagline: string
  /** Longer explanation shown in the bento. */
  about: string
  status: ProjectStatus
  /** Image for the bento header. Omit to use the project's drawn emblem. */
  image?: string
  technologies: string[]
  links: ProjectLink[]
  /** Where the star sits in the sky, as percentages of the sky area. */
  star: { x: number; y: number; mobileX: number; mobileY: number }
  /** Name of a live stats source, if the project has one. */
  stats?: "looksy" | "github"
}

export const projects: Project[] = [
  {
    slug: "looksy",
    name: "Looksy",
    tagline: "An AI agent that finds the products in social media posts.",
    about:
      "Send Looksy a post or reel on Instagram and it spots the items in it, then finds where to buy them. It runs entirely inside Instagram messages, so there is nothing to install.",
    status: "Live",
    image: "/project-media/looksy.jpg",
    technologies: ["Computer vision", "LLM agents", "Supabase", "n8n", "Instagram API"],
    links: [{ label: "Try it on Instagram", href: "https://instagram.com/trylooksy" }],
    star: { x: 28, y: 50, mobileX: 24, mobileY: 44 },
    stats: "looksy",
  },
  {
    slug: "rig2rescue",
    name: "Rig2Rescue",
    tagline: "A 3D knot trainer for rope access and rescue technicians.",
    about:
      "Rig2Rescue teaches the knots that rope access and rescue teams rely on. Each knot is a 3D rope you tie step by step, then dress and set, with notes on what it's for and what to check before loading.",
    status: "In development",
    technologies: ["Unity", "three.js", "Python", "Supabase"],
    links: [],
    star: { x: 72, y: 50, mobileX: 76, mobileY: 44 },
    stats: "github",
  },
]

/** A faint, unclickable star that hints at what's next. */
export const upcomingStar = {
  name: "Coming soon",
  tagline: "Something new is forming.",
  star: { x: 50, y: 60, mobileX: 50, mobileY: 54 },
}

export const site = {
  name: "Keeda Scully",
  intro: "Turning ideas into things people use.",
  socials: [
    { name: "X", url: "https://x.com/keedafish" },
    { name: "Instagram", url: "https://instagram.com/keedafish" },
  ],
}
