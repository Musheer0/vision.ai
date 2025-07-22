"use client"
import { useTrpc } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import FragmentBody from './fragment-body'
import { useActiveFragmentStore } from '@/stores/active-fragment-store'
import { Loader2 } from 'lucide-react'

const FragmentChat = ({id}:{id:string}) => {
    const trpc = useTrpc()
    const {isPending, data} = useQuery({
        queryKey: [`fragment-${id}`],
        queryFn:async()=>await trpc.fragment.getFragments.query({visionId:id})
    });
    const {fragment ,setFragment} = useActiveFragmentStore();
    useEffect(()=>{
        if(!fragment && data){
            const frag = data.find((f)=>f.type=='AI' && !f.isCompleted);
            if(frag)setFragment(frag)
        }
    },[data])
if(isPending)
  return (
    <div className='flex w-full flex-1 justify-center items-center'>
        <Loader2 className='animate-spin'/>
    </div>
  )
if(data){
    return(
        <div className='flex max-w-5xl overflow-y-auto px-[10px]   pt-2 w-full flex-1 mx-auto flex-col gap-2'>
            {data.map((f,i)=><FragmentBody fragment={f} key={i}/>)}
        </div>
    )
}
}

export default FragmentChat