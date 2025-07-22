import { JsonValue } from '@prisma/client/runtime/library';
import { create } from 'zustand';
type Sandbox = {url:string ,files:JsonValue,id:string}

type SandboxStore = {
  sandbox: Sandbox | null;
  setSandbox: (sandbox: Sandbox | null) => void;
};

export const useSandboxStore = create<SandboxStore>((set) => ({
  sandbox: null,
  setSandbox: (sandbox) => set({ sandbox }),
}));
