import Image from 'next/image'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Trash2Icon, X } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'

const FragmentChatHeader = ({title}:{title:string}) => {
  return (
   <DropdownMenu>
    <DropdownMenuTrigger className='max-w-5xl sticky top-0 mx-auto  w-full bg-background'>
         <div className='flex hover:bg-muted-foreground/10  py-2  px-3 cursor-pointer rounded-xl items-center gap-2'>
          <Image
                    src={'/logo-black.png'}
                    width={30}
                    height={30}
                    alt='logo'
                    />
        < p className='text-sm line-clamp-1 text-ellipsis font-bold'>Vision Ai/<span className='text-muted-foreground'>{title}</span></p>
    </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent side='bottom' >
       <AlertDialog>
        <AlertDialogTrigger>
             <DropdownMenuItem className='mr-auto text-destructive hover:bg-destructive/10' variant='destructive'>
            <Trash2Icon/> Delete Project
        </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>
                    <X/> Cancle
                </AlertDialogCancel>
                <AlertDialogAction>
                                <Trash2Icon/> Delete Project

                    </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>
    </DropdownMenuContent>
   </DropdownMenu>
  )
}

export default FragmentChatHeader