import React, { Suspense } from 'react'
import Visions from './_components/visions'
import { VisionGridSkeleton } from './_components/loaders'
export const dynamic = "force-dynamic"
const page = () => {
  return (
    <div className='overflow-y-auto'>
      <Suspense fallback={<VisionGridSkeleton/>}>
        <Visions/>
      </Suspense>
    </div>
  )
}

export default page