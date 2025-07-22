import { trpc } from "@/trpc/server"
import { Suspense } from "react"
import { VisionCard } from "./vision-card"
import { VisionGridSkeleton } from "./loaders"

const VisionsContent = async () => {
  const visions = await trpc.vision.getAll()

  if (!visions || visions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Visions Found</h3>
        <p className="text-muted-foreground">
          {"You haven't created any visions yet. Start by creating your first vision!"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {visions.map((vision) => (
        <VisionCard key={vision.id} vision={vision} />
      ))}
    </div>
  )
}

const Visions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Visions</h1>
        <p className="text-muted-foreground">Manage and explore your creative visions</p>
      </div>

      <Suspense fallback={<VisionGridSkeleton />}>
        <VisionsContent />
      </Suspense>
    </div>
  )
}

export default Visions
