import CreateFragment from '@/components/fragment/create-fragment'
import FragmentBody from '@/components/fragment/fragment-body'
import FragmentChatHeader from '@/components/fragment/fragment-chat-header'
import React from 'react'

const page = () => {
  return (
    <div className='p-10 bg-background flex flex-col gap-2 overflow-auto flex-1 w-full'>
      <FragmentChatHeader title='Netflix Clone'/>
       <FragmentBody type='USER'/>
       <FragmentBody type='AI'/>
       <FragmentBody type='ERROR'/>
       <CreateFragment id={'efs'}/>
    </div>
  )
}

export default page