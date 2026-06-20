"use client"

import { useEffect, useState } from "react"

interface ManifestoModalProps {
  isOpen: boolean
}

export function ManifestoModal({ isOpen }: ManifestoModalProps) {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // 1 second delay before showing
      const timer = setTimeout(() => {
        setShouldShow(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setShouldShow(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Glassmorphic Box */}
      {shouldShow && (
        <div className="relative z-30 px-4 mt-12">
          <div
            className="relative w-full max-w-4xl mx-auto rounded-3xl p-12 animate-in fade-in duration-500"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
          >
            {/* Manifesto Content */}
            <div className="text-white space-y-6 text-center">
              <p className="text-lg italic leading-relaxed">
                This presents a fun space to share what inspires me.
              </p> <p className="text-lg italic leading-relaxed">
                At the heart is creativity and the burning desire to build something new and meaningful.
                Thanks to a new era in technology, I&apos;m able to to build these ideas.
              </p>
              <p className="text-lg italic leading-relaxed">
                &quot;The future belongs to those bold enough to dream big and brave enough to act on it. &apos;
              </p>


            </div>
          </div>
        </div>
      )}
    </>
  )
}
