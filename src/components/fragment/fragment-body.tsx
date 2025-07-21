import { Fragment } from '@prisma/client'
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { SquareArrowOutUpRightIcon } from 'lucide-react'
import { TextShimmer } from '../motion-primitives/text-shimmer'
import { formatPrettyDate } from '@/lib/utils'

const FragmentBody = ({fragment}:{fragment:Fragment}) => {
    const {type,isCompleted,user_summary,name:msg,error,sandBoxUrl,status, updatedAt} =fragment;
if(type==='USER')
  return (
    <div className='px-3 max-w-[80%] rounded-xl py-2 bg-muted-foreground/10 w-fit  ml-auto'>
        {msg}
    </div>
  )
 if(type==='ERROR')
  return (
    <div className='px-3 rounded-xl py-2 flex-col  gap-3 w-full  mr-auto group'>
        <div className="header flex justify-between w-full items-center">
            <div className="logo flex items-center gap-2">
                <Image
            src={'/logo-black.png'}
            width={40}
            height={40}
            alt='logo'
            />
            <p className='font-bold text-xl text-destructive'>Vision.Ai</p>
            </div>
            <p className='text-xs text-muted-foreground group-hover:opacity-100 opacity-0'>{formatPrettyDate(new Date(updatedAt))}</p>
        </div>
        <div className="chat p-2 break-words">
           <div className='px-3 text-sm rounded-xl py-2 bg-destructive/10 text-destructive border border-destructive w-full text-center  ml-auto'>
        {error}
    </div>
        </div>
        <div className=" py-2">
            <p className='text-xs text-muted-foreground'>don&apos;t worry your token will be refunded, try reloading the page it token not refunded</p>
        </div>
    </div>
  )
if(type==='AI' )
  return (
    <div className='px-3 rounded-xl py-2 flex-col  gap-3 w-full  mr-auto group'>
        <div className="header flex justify-between w-full items-center">
            <div className="logo flex items-center gap-2">
                <Image
            src={'/logo-black.png'}
            width={40}
            height={40}
            alt='logo'
            />
            <p className='font-bold text-xl'>Vision.Ai</p>
            </div>
            <p className='text-xs text-muted-foreground group-hover:opacity-100 opacity-0'>{formatPrettyDate(new Date(updatedAt))}</p>
        </div>
        <div className="chat p-2 break-words">
           {isCompleted ? user_summary:  <TextShimmer duration={0.8}>{status||"starting"}</TextShimmer>}
        </div>
       {isCompleted && sandBoxUrl && 
        <div className="preview py-2">
            <Button className='cursor-pointer'>
                Preview <SquareArrowOutUpRightIcon/>
            </Button>
        </div>
       }
    </div>
  )
 
}

export default FragmentBody