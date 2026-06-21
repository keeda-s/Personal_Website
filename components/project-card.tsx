"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"

interface ProjectCardProps {
  title: string
  description: string
  delay?: number
  mediaType?: 'image' | 'video'
  mediaSrc?: string
}

export function ProjectCard({ 
  title, 
  description, 
  delay = 0,
  mediaType,
  mediaSrc
}: ProjectCardProps) {
  return (
    <Card
      className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Media Section */}
      {mediaSrc && (
        <div className="relative h-48 w-full overflow-hidden">
          {mediaType === 'image' ? (
            <Image
              src={mediaSrc}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            >
              <source src={mediaSrc} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      <div className="relative p-6 space-y-3">
        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
          {description}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </Card>
  )
}