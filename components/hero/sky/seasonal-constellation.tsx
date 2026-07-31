"use client"

import { useMemo } from "react"

type Point = [number, number]
type ConstellationPattern = {
  name: string
  points: Point[]
  links: Array<[number, number]>
}

const monthlyConstellations: ConstellationPattern[] = [
  { name: "Capricorn", points: [[8, 30], [27, 46], [48, 40], [70, 18], [88, 34], [65, 62], [37, 70]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]] },
  { name: "Aquarius", points: [[6, 23], [24, 16], [39, 31], [55, 24], [72, 39], [91, 33], [62, 62], [43, 75]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7]] },
  { name: "Pisces", points: [[8, 32], [24, 18], [39, 28], [52, 48], [70, 65], [88, 55], [78, 34], [58, 18]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 3]] },
  { name: "Aries", points: [[12, 60], [35, 43], [58, 31], [82, 35], [92, 21]], links: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { name: "Taurus", points: [[9, 57], [28, 45], [46, 48], [60, 34], [77, 20], [62, 62], [82, 76], [48, 17]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [3, 7]] },
  { name: "Gemini", points: [[18, 13], [35, 26], [38, 51], [31, 77], [68, 14], [59, 31], [62, 55], [72, 78], [49, 42]], links: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 8], [8, 5]] },
  { name: "Cancer", points: [[10, 25], [29, 35], [47, 47], [68, 31], [90, 18], [62, 66], [78, 82]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]] },
  { name: "Leo", points: [[8, 67], [27, 57], [47, 62], [65, 47], [78, 29], [70, 14], [55, 19], [51, 36], [91, 39]], links: [[0, 1], [1, 2], [2, 3], [3, 8], [3, 4], [4, 5], [5, 6], [6, 7], [7, 3]] },
  { name: "Virgo", points: [[5, 28], [25, 38], [45, 31], [57, 53], [78, 70], [94, 61], [49, 78], [73, 22]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [3, 6], [2, 7]] },
  { name: "Libra", points: [[17, 20], [43, 31], [72, 20], [84, 55], [55, 74], [26, 59]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]] },
  { name: "Scorpio", points: [[5, 20], [23, 28], [39, 42], [50, 62], [66, 76], [82, 65], [92, 45], [85, 28], [76, 19]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]] },
  { name: "Sagittarius", points: [[9, 57], [28, 42], [47, 52], [64, 36], [88, 26], [73, 63], [48, 75], [30, 67], [50, 24]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [5, 6], [6, 7], [7, 1], [3, 8]] },
]

export function SeasonalConstellation() {
  const pattern = useMemo(() => {
    const requested = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("constellation")?.toLowerCase()
      : null
    return monthlyConstellations.find((item) => item.name.toLowerCase() === requested)
      ?? monthlyConstellations[new Date().getMonth()]
  }, [])

  return (
    <div className="hero-seasonal-constellation" aria-label={`${pattern.name}, constellation for this month`}>
      <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
        <g className="seasonal-constellation-beams">
          {pattern.links.map(([from, to], index) => (
            <line
              key={`${from}-${to}-${index}`}
              x1={pattern.points[from][0]}
              y1={pattern.points[from][1]}
              x2={pattern.points[to][0]}
              y2={pattern.points[to][1]}
              style={{ "--beam-index": index } as React.CSSProperties}
            />
          ))}
        </g>
        <g className="seasonal-constellation-stars">
          {pattern.points.map(([x, y], index) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={index % 3 === 0 ? 1.5 : 1} />
          ))}
        </g>
      </svg>
      <span>{pattern.name}</span>
    </div>
  )
}
