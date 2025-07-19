import { ThemeProvider } from '@/components/providers/theme-provider'
import { TRPCProvider } from '@/trpc/client'
import React from 'react'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
    <TRPCProvider>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <main className='w-full h-screen overflow-hidden'>
            {children}
        </main>
        </ThemeProvider>
    </TRPCProvider>
  )
}

export default layout