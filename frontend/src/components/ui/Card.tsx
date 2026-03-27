'use client'

import { forwardRef, HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl border
          
          bg-zinc-800/80
          border-zinc-700/60

          shadow-[0_4px_20px_rgba(0,0,0,0.45)]

          ${
            hover
              ? `
              transition-all duration-300
              hover:-translate-y-1
              hover:border-zinc-700/70
              hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)]
              `
              : ""
          }

          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

export default Card