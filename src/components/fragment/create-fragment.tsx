/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useTrpc } from '@/trpc/client';
import { Fragment, Usage, Vision } from '@prisma/client';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '../ui/button';
import { ArrowUp, ImagePlusIcon, Loader2Icon, MenuIcon } from 'lucide-react';
import TokenUsage from '../shared/token-usage';

const CreateFragment = ({id}:{id:string}) => {
  const query_client = useQueryClient();
  const vision = query_client.getQueryData<Vision>([id]);
  
  const fragments = query_client.getQueryData<Fragment[]>([`fragment-${id}`]);
const data:any = query_client.getQueryData(['credits-usage']);
  const [prompt ,setPrompt] = useState('');
  
  const [error ,setError] = useState('')
  useEffect(()=>{
    if(!prompt) {
        const p = localStorage.getItem(`fragment-${id}`);
        if(p) setPrompt(p)
    }
  },[]);
  const HandleChange = (e:React.ChangeEvent<HTMLTextAreaElement>)=>{
    localStorage.setItem(`fragment-${id}`,e.target.value);
    setPrompt(e.target.value);
  };
  const trpc = useTrpc()
  const {mutate, isError, isPending} = useMutation({
    mutationFn: async()=>await trpc.fragment.create.mutate({prompt,vision_id:id}),
    onSuccess:(data)=>{
        if(data?.fragments){
         toast.success("request sent!");
         query_client.setQueryData([`fragment-${id}`],(old:Fragment[]|undefined)=>{
        if(!old) return data?.fragments;
        return [...old,...data?.fragments]
     })
     }
    },
    onError:(data)=>{
        setError(data.message)
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
// if(data && fragments)
  return (
    <div className='bg-background border p-4 rounded-3xl shadow-2xl/10'>
        <TokenUsage/>
        <TextareaAutosize
        value={prompt}
        onChange={HandleChange}
        minRows={2}
        className='w-full p-0.5 focus:outline-none resize-none'
        maxRows={10}
        placeholder='what do want to modify?'
        />
       <div className='flex items-center justify-between gap-2'>
        <Button size={'free'} className='p-1 rounded-full' variant={'ghost'} disabled={isPending}>
            {isPending ?
            <Loader2Icon className='animate-spin'/>
            :
            <MenuIcon/>    
            }
        </Button>
         <Button size={'free'} variant={'outline'} className='p-1.5 px-2 ml-auto text-xs rounded-full' disabled={true}>
            {isPending ?
            <Loader2Icon className='animate-spin'/>
            :
            <ImagePlusIcon/>    
            }
            Add Image
        </Button> 
        <Button
        onClick={()=>mutate()}
        size={'free'} className='p-1.5 cursor-pointer rounded-full' disabled={isPending||prompt.length<2 || data?.token_left==0}>
            {isPending ?
            <Loader2Icon className='animate-spin'/>
            :
            <ArrowUp/>    
            }
        </Button>
       </div>
    </div>
  )
}

export default CreateFragment