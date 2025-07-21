/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useTrpc } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '../ui/button';
import { ArrowUp, ImagePlusIcon, Loader2,  ShapesIcon, Zap,ShieldAlertIcon } from 'lucide-react';
import {toast} from 'sonner'
import { useTypewriterPlaceholder } from '@/app/(root)/create/_components/place-holder';
import { Badge } from '../ui/badge';
import TokenUsage from '../shared/token-usage';
import { Usage } from '@prisma/client';
import { useActiveFragmentStore } from '@/stores/active-fragment-store';
import { useRouter } from 'next/navigation';
const CreateVision = () => {
    const [prompt,setPrompt] = useState('');
    const trpc = useTrpc();
    const placeholderText= useTypewriterPlaceholder()
    const query_client = useQueryClient();
    const {setFragment} = useActiveFragmentStore()
    const [error,setError] = useState('');
    const router = useRouter();
    const data:any = query_client.getQueryData(['credits-usage']);
    const { mutate, isError ,isPending} =useMutation({
        mutationFn:async()=>await trpc.vision.create.mutate({prompt}),
        onSuccess:(data)=>{
          toast.success("ai is cooking please wait");
          localStorage.removeItem("prompt");
            query_client.setQueryData([data.vision.id],{...data.vision});
            query_client.setQueryData([`fragment-${data.vision.id}`],[...data.fragments]);
            const frag = data.fragments.find((f)=>f.type==='AI' && !f.isCompleted);
            if(frag) setFragment(frag);
            if(data.warning) toast.warning(data.warning);
            router.push('/vision/'+data.vision.id);
        },
        onError:(data)=>{
          setError(data.message);
          toast.error(data.message);
           if(data){
            query_client.setQueryData(['credits-usage'], (oldData:Usage|undefined)=>{
              if(oldData) return {...oldData,token_left:oldData.token_left+1};
              return oldData
            })
          }
        },
        onMutate:()=>{
          if(data){
            query_client.setQueryData(['credits-usage'], (oldData:Usage|undefined)=>{
              if(oldData) return {...oldData,token_left:oldData.token_left-1};
              return oldData
            })
          }
        }
    });
    useEffect(()=>{
      if(prompt) return;
      const p = localStorage.getItem("prompt");
      if(p) setPrompt(p);
    },[])
  return (
    <>
    <section className='w-full shadow-xl/10 z-10 p-3 rounded-3xl pt-3  flex flex-col relative 
    bg-background 
    border 
    items-center justify-center max-w-3xl'>
       <div className='flex items-center w-full gap-2'>
         {isError && <>
       <Badge variant={'destructive'} className=''><ShieldAlertIcon/>{error}</Badge>
        </>}
            <TokenUsage/>
       </div>
      <TextareaAutosize
      className='w-full px-1  focus:outline-0 resize-none'
      value={prompt}
      onChange={(e)=>{
        localStorage.setItem("prompt",e.target.value);
        setPrompt(e.target.value);
      }}
      minRows={3}
      maxRows={10}
      disabled={isPending}
      placeholder={placeholderText}
      />
      <div className="actions gap-2  flex w-full items-center justify-between">
         <Button size={'free'}
         title='comming soon'
         variant={'outline'}
        className='p-2 rounded-full cursor-pointer'
        disabled={true}
        >
        {isPending ? <Loader2 className='animate-spin'/>:<ImagePlusIcon/>}
        Attach Image
      </Button>
        <Button size={'free'}
        title='comming soon'
         variant={'outline'}
        className='p-2 rounded-full cursor-pointer'
        disabled={true}>
        {isPending ? <Loader2 className='animate-spin'/>:<Zap/>}
        Supabase
      </Button>
       <Button size={'free'}
         variant={'outline'}
         title='comming soon'
        className='p-2 rounded-full mr-auto cursor-pointer'
        disabled={true}
        >
        {isPending ? <Loader2 className='animate-spin'/>:<ShapesIcon/>}
        Import from figma
      </Button>
        <Button size={'free'} onClick={()=>mutate()}
        className='p-2 rounded-full cursor-pointer'
        disabled={isPending || prompt.length<2 || !data ||data?.token_left===0}>
        {isPending ? <Loader2 className='animate-spin'/>:<ArrowUp/>}
      </Button>
      </div>
    </section>
    </>
  )
}

export default CreateVision