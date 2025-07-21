"use client"
import { useTrpc } from '@/trpc/client'
import { Vision } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import FragmentChatHeader from './fragment-chat-header'
import FragmentChat from './fragment-chat'
import CreateFragment from './create-fragment'
import ActiveFragmentListner from '../listners/active-fragment-status-listner'

const VisionView = ({id}:{id:string}) => {
  const trpc = useTrpc();
  const {data,isLoading} = useQuery({
    queryKey: [id],
    queryFn:async()=>await trpc.vision.getById.query({visionId:id})
  });
if(isLoading) return <>Loading</>
if(data)
  return (
    <section className='w-full overflow-auto flex flex-col items-center  h-screen'>
      <FragmentChatHeader title={data.name}/>
      <FragmentChat id={id}/>
      <CreateFragment id={id}/>
      <ActiveFragmentListner/>
    </section>
  )
}

export default VisionView