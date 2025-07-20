import ReactQueryProvider from '@/components/providers/react-query-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TRPCProvider } from '@/trpc/client'
import React from 'react'
import { Toaster } from 'sonner'

const layout = ({children}:{children:React.ReactNode}) => {
  return (
   <ReactQueryProvider>
     <TRPCProvider>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <main className='w-full h-screen flex flex-col overflow-hidden'>
          <Toaster richColors/>
            {children}
        </main>
        </ThemeProvider>
    </TRPCProvider>
   </ReactQueryProvider>
  )
}

export default layout