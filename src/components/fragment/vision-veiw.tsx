"use client"
import { useTrpc } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import FragmentChat from './fragment-chat'
import CreateFragment from './create-fragment'
import ActiveFragmentListner from '../listners/active-fragment-status-listner'
import { ShieldAlert, RefreshCcw, ArrowLeft, DownloadIcon, Loader } from 'lucide-react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Loader2Icon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyIcon } from 'lucide-react'
import { CodeEditor } from '../code-editor/code-editor'
import { useSandboxStore } from '@/stores/sandbox-store'
import { useActiveFragmentStore } from '@/stores/active-fragment-store'
const VisionView = ({id}:{id:string}) => {
  const trpc = useTrpc();
  const router = useRouter();
  const {fragment} = useActiveFragmentStore()
  const {sandbox} = useSandboxStore()
  const {data,isLoading,isError} = useQuery({
    queryKey: [id],
    queryFn:async()=>await trpc.vision.getById.query({visionId:id}),
    retry:false
  });
if(isError) 
  return(
   <section className="w-full h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 border border-destructive/30 text-foreground p-8 rounded-2xl shadow-sm max-w-md w-full flex flex-col items-center gap-5">
        <ShieldAlert size={64} className="text-destructive" />
        <h1 className="text-2xl font-bold">Uh-oh. Error loading your vision.</h1>
        <p className="text-muted-foreground text-sm">
          Something broke. It&apos;s not you, it&apos;s us. Try again or go back and create something new.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full justify-center">
          <Button
            variant="destructive"
            onClick={() => window.location.reload()}
            aria-label="Try Again"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button
            onClick={() => router.push('/create')}
            aria-label="Go Back"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    </section>
  )
if(isLoading) 
   return (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
if(data)
  return (
    <section className='w-full overflow-auto flex flex-col items-center  h-screen'>
      <ActiveFragmentListner/>
       <nav className='w-full p-2 border-b'>
           <div className="logo flex items-center gap-2">
            <img src="/logo.png" className='w-10 h-10' alt="" />
            <p>Vision.Ai/{data.name}</p>
           </div>
       </nav>
           <ResizablePanelGroup direction="horizontal">
           <ResizablePanel defaultSize={27} minSize={25} className='flex px-1 flex-col' >
            <FragmentChat id={id}/>
            <CreateFragment id={id}/>
           </ResizablePanel>
           <ResizableHandle  withHandle/>
           <ResizablePanel defaultSize={70} maxSize={77} className='border-none'>
          <Tabs defaultValue="view" className='p-0 w-full h-full' >
      <div className="header bg-muted-foreground/5 gap-2 px-2 py-1  flex items-center justify-between">
        <TabsList className='rounded-full h-full' >
         {['view','code'].map((t,i)=><TabsTrigger className='rounded-full' value={t} key={i}>{t}</TabsTrigger>)}
       </TabsList>
         <div className="url flex bg-muted-foreground/10 py-1 cursor-pointer flex-1 items-center justify-between px-2  rounded-full">
           <p>{sandbox?.url||"https://example.com" }</p>
           <button className='cursor-pointer p-1.5 rounded-full hover:bg-muted-foreground/10'><CopyIcon size={14}/></button>
         </div>
         <Button size={'free'} variant={'outline'} className='p-2 rounded-2xl cursor-pointer'>
        <DownloadIcon/>
      </Button>
      </div>
      
       <TabsContent value="view" className='w-full relative h-full'>
<iframe 
  src={sandbox?.url||"/building" }
  width="100%" 
  height="100%"
  className='z-10'
  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-top-navigation allow-top-navigation-by-user-activation allow-presentation allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
  allow="geolocation; microphone; camera; midi; encrypted-media; clipboard-write; fullscreen; display-capture; autoplay; xr-spatial-tracking; usb; serial; accelerometer; magnetometer; gyroscope; payment">
</iframe>
<div className='absolute w-full h-full z-10 flex items-center justify-center gap-2'>
  Build App <Loader className='animate-spin'/>
</div>
       </TabsContent>
       <TabsContent value="code" className='p-0'>
        {sandbox?.files ? <CodeEditor id={id} initialFiles={sandbox?.files}/>:<div className='w-full h-full flex text-muted-foreground items-center justify-center'>No Code Opened yet...</div>}
       </TabsContent>
     </Tabs>
       </ResizablePanel>
     </ResizablePanelGroup>
    </section>
  )
}

export default VisionView