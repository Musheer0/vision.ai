import { Type } from '@prisma/client'
import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { SquareArrowOutUpRightIcon } from 'lucide-react'

const FragmentChat = ({type}:{type:Type}) => {
if(type==='USER')
  return (
    <div className='px-3 rounded-xl py-2 bg-muted-foreground/10 w-fit  ml-auto'>
        Lorem ipsum dolor sit amet consectetur.
    </div>
  )
if(type==='AI')
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
            <p className='text-xs text-muted-foreground group-hover:opacity-100 opacity-0'>12/07/25 at 8:45 pm</p>
        </div>
        <div className="chat p-2 break-words">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Explicabo, laboriosam distinctio. Quibusdam maiores mollitia quia asperiores nostrum porro, dolore commodi! Aperiam labore qui facere possimus, laborum sunt eligendi, amet mollitia commodi ipsa officia impedit molestiae dignissimos voluptates assumenda quasi voluptatem optio sed iste maiores quaerat accusantium aut fugiat minima. Praesentium?
        </div>
        <div className="preview py-2">
            <Button className='cursor-pointer'>
                Preview <SquareArrowOutUpRightIcon/>
            </Button>
        </div>
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
            <p className='text-xs text-muted-foreground group-hover:opacity-100 opacity-0'>12/07/25 at 8:45 pm</p>
        </div>
        <div className="chat p-2 break-words">
           <div className='px-3 text-sm rounded-xl py-2 bg-destructive/10 text-destructive border border-destructive w-full text-center  ml-auto'>
        Error Generating your vision
    </div>
        </div>
        <div className=" py-2">
            <p className='text-xs text-muted-foreground'>don&apos;t worry your token will be refunded, try reloading the page it token not refunded</p>
        </div>
    </div>
  )
}

export default FragmentChat