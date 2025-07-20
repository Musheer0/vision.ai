"use client"
import { cn } from '@/lib/utils'
import { useTrpc } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Badge } from '../ui/badge'
import { Loader2Icon, ShieldAlertIcon } from 'lucide-react'

const TokenUsage = () => {
    const trpc = useTrpc()
    const {data, isLoading, isError} = useQuery({
        queryKey: ['credits-usage'],
        queryFn:async()=>await trpc.token.usage.query(),
        refetchOnWindowFocus: false
    });
    const tokens = data?.token_left||0
    if(isError) {
   <Badge
    variant={"outline"}
    >
      <ShieldAlertIcon/> Error Loading Tokens
    </Badge>
}
if(isLoading) {
  return(
     <Badge
    variant={"outline"}
    >
      <Loader2Icon className='animate-spin'/>Loading Tokens
    </Badge>
  )
}
  return (
    <Badge
    variant={tokens>=8 ? "secondary": tokens>=5 ? 'default': 'destructive'}
    >
      You have {tokens} tokens left {tokens===0 && 'upgrade to get more tokens'}
    </Badge>
  )
}

export default TokenUsage