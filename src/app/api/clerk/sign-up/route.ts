import prisma from '@/db'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)
    const { id } = evt.data
    const eventType = evt.type
    try {
        if(!id || eventType!=='user.created') return NextResponse.json({error:'clerk id not found'},{status:500})
            const {data} = evt;
        
     await prisma.user.create({
            data:{
                clerk_id: id,
                email: data.email_addresses.map((e)=>e.email_address),
                name:`${data.first_name} ${data.last_name}`
            }
        });
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:'error creating user'},{status:500})
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}