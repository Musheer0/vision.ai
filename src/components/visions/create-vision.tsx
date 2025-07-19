"use client"
import { useTrpc } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '../ui/button';
import { ArrowUp, Loader2 } from 'lucide-react';
import {toast} from 'sonner'
const CreateVision = () => {
    const [prompt,setPrompt] = useState('');
    const trpc = useTrpc();
    const query_client = useQueryClient()
    const { mutate, isError ,isPending} =useMutation({
        mutationFn:async()=>await trpc.vision.create.mutate({prompt}),
        onSuccess:(data)=>{
            if(data?.warning)toast.warning(data.warning)
            query_client.setQueryData([data.vision.id],{...data.vision, fragments:data.fragments})
        }
    });
  return (
    <section className='w-full flex-1 flex flex-col items-center justify-center'>
        {isError && <p>Error </p>}
      <TextareaAutosize
      value={prompt}
      onChange={(e)=>setPrompt(e.target.value)}
      minRows={3}
      maxRows={10}
      disabled={isPending}
      />
      <Button size={'icon'} onClick={()=>mutate()} disabled={isPending}>
        {isPending ? <Loader2 className='animate-spin'/>:<ArrowUp/>}
      </Button>
    </section>
  )
}

export default CreateVision