"use client"
import { useActiveFragmentStore } from '@/stores/active-fragment-store';
import { useTrpc } from '@/trpc/client'
import { Fragment, Vision } from '@prisma/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ActiveFragmentListner = () => {
    const trpc = useTrpc();
    const query_client = useQueryClient();
    const {fragment,setFragment} = useActiveFragmentStore();
    console.log(fragment,'list')
   const HandleFragment = async () => {
  if (fragment && !fragment.isCompleted) {
   try {
     const status = await trpc.fragment.pollStatus.query({ id: fragment.id });
      console.log(status, 'TRPC')
    if (typeof status === 'string') {
        if(fragment){
             query_client.setQueryData(
        [`fragment-${fragment.vision_id}`],
        (old: Fragment[] | undefined) => {
          if (!old) return old;
          const updated = old.map((f) => (f.id === fragment.id ? {...f,status} : f));
          return updated;
        }
      );
        }
    }
    if (status && typeof status !== 'string') {
        setFragment(null);
      query_client.setQueryData(
          [`fragment-${status.vision_id}`],
          (old: Fragment[] | undefined) => {
              if (!old) return old;
              const updated = old.map((f) => (f.id === status.id ? status : f));
              return updated;
            }
        );
        toast.success("your app is ready!")
    }
   } catch (error) {
    console.log(error);
    toast.error("Error fetching status try reloading the page")
   }
  }

  return null;
};

    const {} = useQuery({
        queryKey: ['active-fragment',fragment?.vision_id],
        queryFn:HandleFragment,
        refetchInterval: fragment && !fragment.isCompleted ? 2000 : false,
        enabled: !!fragment && !fragment?.isCompleted,
        refetchOnWindowFocus:false
        
    })
  return <div></div>
}

export default ActiveFragmentListner