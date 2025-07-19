import { Fragment } from '@prisma/client';
import {create} from 'zustand';
interface istore{
    fragment:Fragment|null,
    setFragment:(data:Fragment|null)=>void
}

export const useActiveFragmentStore = create<istore>((set, get)=>({
    fragment:null,
    setFragment:(data)=>{
        set({fragment:data})
    }
}));