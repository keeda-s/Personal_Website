export type CosmicEventCategory = "nature" | "evolution" | "humanity"
export type CosmicEventRarity = "common" | "uncommon" | "rare" | "legendary"
export type CosmicEventVisual = "orbital-spark" | "living-helix" | "deep-time-dust" | "constellation-bloom"

export type CosmicEvent = {
  id: string
  category: CosmicEventCategory
  rarity: CosmicEventRarity
  visual: CosmicEventVisual
  title: string
  fact: string
  sourceLabel: string
  sourceUrl: string
  live?: boolean
  observedAt?: string
}

export const curatedCosmicEvents: CosmicEvent[] = [
  {
    id: "sunlight-eight-minutes",
    category: "nature",
    rarity: "common",
    visual: "orbital-spark",
    title: "Travelling light",
    fact: "Sunlight crossing the space between the Sun and Earth takes about eight minutes.",
    sourceLabel: "NASA Space Place",
    sourceUrl: "https://spaceplace.nasa.gov/sun-compare/en/",
  },
  {
    id: "planet-around-most-stars",
    category: "nature",
    rarity: "uncommon",
    visual: "constellation-bloom",
    title: "Worlds everywhere",
    fact: "Most stars in the Milky Way are thought to have planets of their own.",
    sourceLabel: "NASA Science",
    sourceUrl: "https://science.nasa.gov/exoplanets/what-is-the-universe/",
  },
  {
    id: "earth-magnetic-shield",
    category: "nature",
    rarity: "rare",
    visual: "deep-time-dust",
    title: "Invisible shelter",
    fact: "Motion in Earth’s metallic outer core generates the magnetic field that helps shield our planet from charged solar particles.",
    sourceLabel: "NASA Science",
    sourceUrl: "https://science.nasa.gov/earth/earth-observatory/earths-magnetosphere-protecting-our-planet-from-harmful-space-energy/",
  },
  {
    id: "atoms-forged-in-stars",
    category: "nature",
    rarity: "legendary",
    visual: "constellation-bloom",
    title: "Made by stars",
    fact: "Many elements in our bodies, including carbon and oxygen, were forged inside earlier generations of stars.",
    sourceLabel: "NASA Universe",
    sourceUrl: "https://science.nasa.gov/universe/stars/",
  },
  {
    id: "oxygenic-photosynthesis",
    category: "evolution",
    rarity: "common",
    visual: "living-helix",
    title: "A planetary invention",
    fact: "Ancient photosynthetic organisms gradually transformed Earth by releasing oxygen into its atmosphere.",
    sourceLabel: "Smithsonian Ocean",
    sourceUrl: "https://ocean.si.edu/through-time/ancient-seas/oxygen-and-early-life",
  },
  {
    id: "life-shared-code",
    category: "evolution",
    rarity: "common",
    visual: "living-helix",
    title: "One living language",
    fact: "Almost every known organism stores hereditary information using the same four-letter DNA alphabet.",
    sourceLabel: "National Human Genome Research Institute",
    sourceUrl: "https://www.genome.gov/about-genomics/fact-sheets/DNA-Fact-Sheet",
  },
  {
    id: "cambrian-diversification",
    category: "evolution",
    rarity: "uncommon",
    visual: "deep-time-dust",
    title: "Life diversifies",
    fact: "During the Cambrian Period, animal life diversified dramatically and many major body plans entered the fossil record.",
    sourceLabel: "Smithsonian National Museum of Natural History",
    sourceUrl: "https://naturalhistory.si.edu/education/teaching-resources/anthropology-and-social-studies/deep-time",
  },
  {
    id: "common-ancestor",
    category: "evolution",
    rarity: "rare",
    visual: "constellation-bloom",
    title: "The branching tree",
    fact: "Every species alive today belongs to one branching history of descent extending deep into Earth’s past.",
    sourceLabel: "Smithsonian Human Origins",
    sourceUrl: "https://humanorigins.si.edu/education/introduction-human-evolution",
  },
  {
    id: "flight-to-moon",
    category: "humanity",
    rarity: "rare",
    visual: "orbital-spark",
    title: "Sixty-six years",
    fact: "Only 66 years separated the Wright brothers’ first powered flight in 1903 from Apollo 11 landing humans on the Moon in 1969.",
    sourceLabel: "NASA History",
    sourceUrl: "https://www.nasa.gov/history/alsj/a11/a11.html",
  },
  {
    id: "continuous-space-presence",
    category: "humanity",
    rarity: "uncommon",
    visual: "orbital-spark",
    title: "Someone above",
    fact: "People have lived continuously aboard the International Space Station since November 2000.",
    sourceLabel: "NASA ISS",
    sourceUrl: "https://www.nasa.gov/international-space-station/space-station-20th-frequently-asked-questions/",
  },
  {
    id: "voyager-interstellar",
    category: "humanity",
    rarity: "uncommon",
    visual: "constellation-bloom",
    title: "A message leaving home",
    fact: "Voyager 1 entered interstellar space carrying a golden record made to represent the life and culture of Earth.",
    sourceLabel: "NASA Voyager",
    sourceUrl: "https://science.nasa.gov/mission/voyager/voyager-1/",
  },
  {
    id: "webb-unfolded",
    category: "humanity",
    rarity: "common",
    visual: "deep-time-dust",
    title: "An observatory unfolds",
    fact: "The James Webb Space Telescope travelled folded inside its rocket, then completed a complex sequence of deployments in space.",
    sourceLabel: "NASA Webb",
    sourceUrl: "https://science.nasa.gov/mission/webb/",
  },
]
