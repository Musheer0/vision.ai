import VisionView from '@/components/fragment/vision-veiw';
import { trpc } from '@/trpc/server';
import React from 'react'

const page = async({params}:{params:Promise<{id:string}>}) => {
    const {id} =await params;
  return <VisionView id={id}/>
}

export default page