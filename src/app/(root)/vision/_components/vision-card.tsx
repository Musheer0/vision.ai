import Link from "next/link"
import type React from "react"

interface Vision {
  id: string
  name: string
  user_id: string
  createdAt: Date
  updatedAt: Date
}

interface VisionCardProps {
  vision: Vision
}

const gradients = [
  "from-purple-500/20 via-pink-500/20 to-red-500/20",
  "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
  "from-green-500/20 via-emerald-500/20 to-cyan-500/20",
  "from-yellow-500/20 via-orange-500/20 to-red-500/20",
  "from-indigo-500/20 via-purple-500/20 to-pink-500/20",
  "from-rose-500/20 via-pink-500/20 to-purple-500/20",
  "from-amber-500/20 via-yellow-500/20 to-lime-500/20",
  "from-slate-500/20 via-gray-500/20 to-zinc-500/20",
]

const getRandomGradient = (id: string) => {
  // Use the ID to generate a consistent random gradient for each card
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export const VisionCard: React.FC<VisionCardProps> = ({ vision }) => {
  const gradientClass = getRandomGradient(vision.id)

  return (
   <Link href={'/vision/'+vision.id}>
     <div className="group relative overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="space-y-4">
          {/* Vision Name */}
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {vision.name}
          </h3>

          {/* Metadata */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="font-medium">Created</span>
              <span>{formatDate(vision.createdAt)}</span>
            </div>

            {vision.updatedAt.getTime() !== vision.createdAt.getTime() && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Updated</span>
                <span>{formatDate(vision.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* ID Badge */}
          <div className="pt-2">
            <span className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              ID: {vision.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
   </Link>
  )
}
