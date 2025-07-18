import { TRPCProvider } from '@/trpc/client'
import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <TRPCProvider>
        <main className='w-full h-screen overflow-hidden'>
            {children}
        </main>
    </TRPCProvider>
  )
}

export default layout