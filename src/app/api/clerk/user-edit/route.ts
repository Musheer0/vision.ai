import prisma from '@/db'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req,{signingSecret:process.env.CLERK_WEBHOOK_USEREDITING_SECRET});
    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log(' Webhook payload:', evt.data)
    if(!id || eventType!=='user.updated')     return new Response('Error verifying webhook', { status: 400 });
    try {
        await prisma.user.update({
            where:{
                clerk_id:id,
            },
            data:{
                email:evt.data.email_addresses.map((e)=>e.email_address),
                name:`${evt.data.first_name} ${evt.data.last_name}`
            }
        })
    } catch (error) {
        console.log(error);
            return new Response('Error updating user', { status: 400 })

    }
    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}