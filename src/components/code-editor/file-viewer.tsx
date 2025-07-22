"use client"
import { File, Folder } from '@/lib/parseFiletree'
import { cn } from '@/lib/utils'
import { FileIcon, FolderIcon } from 'lucide-react'
import React, { useState } from 'react'

const Data = ({data,ActivePath,onclick}:{data:File|Folder,ActivePath:string,onclick:(path:string)=>void}) => {
    const [isOpen ,setIsOpen] = useState(data.content.length>0)
  return (
    <div  className='pl-1 flex flex-col py-1'>
        <div
        onClick={()=>{
            setIsOpen(!isOpen);
            if(data?.type === 'file' && data.originPath){
                onclick(data.originPath);
            }
        }}
        className={cn(
            "header flex items-center gap-2 px-1 hover:bg-muted-foreground/10 rounded-lg cursor-pointer",
            data.type==="file" && ActivePath===data.originPath && 'bg-muted-foreground/10'
        )}>
            {data.type==='file' ? <FileIcon size={15}/>:<FolderIcon size={15}/>}
        <p>{data.name}</p>
        </div>
        {data.type==='folder' && isOpen && <>
        {data.content.map((f,i)=><Data data={f} key={i} ActivePath={ActivePath} onclick={onclick} />)}
        </>}
    </div>
  )
}

export default Data