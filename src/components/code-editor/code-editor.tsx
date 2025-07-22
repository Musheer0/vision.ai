/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client"

import { useState, useCallback } from "react"
import { CodeInput } from "./code-input"
import { FileTextIcon } from "lucide-react"
import { parseFileTree } from "@/lib/parseFiletree"
import Data from "./file-viewer"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "../ui/button"
import { useTrpc } from "@/trpc/client"
import { Fragment } from "@prisma/client"
import { useSandboxStore } from "@/stores/sandbox-store"
import { toast } from "sonner"

interface CodeEditorProps {
  initialFiles?: any
  id:string
}

export function CodeEditor({ initialFiles = {} ,id}: CodeEditorProps) {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles)
  const [activeFile, setActiveFile] = useState<string>(Object.keys(initialFiles)[0] || "");
  const [isEdited, setIsEdited] = useState(false);
  const {sandbox,setSandbox} = useSandboxStore()
  const queryClient = useQueryClient();
  const trpc = useTrpc();
  const { mutate, isPending} = useMutation({
    mutationFn:trpc.fragment.editFiles.mutate,
    onSuccess:(data)=>{
     setFiles(files);
     if(sandbox)
     queryClient.setQueryData([`fragment-${id}`],(old:Fragment[]|undefined)=>{
      if(!old) return old
      return [...old.map((f)=>{
        if( f.id===sandbox?.id ){
          return {...f, files, sandBoxUrl:data.sandbox.url,sandBoxCreatedAt:data.sandbox.createdAt}
        }
       return  f
      })]
     });
     setIsEdited(false);
     if(sandbox?.id && data.sandbox?.url) {
      setSandbox({
         id:sandbox?.id,
         url:data.sandbox.url,
         files
      })      
     }
    },
    onError:(data)=>{
           setIsEdited(false);
      setFiles(initialFiles);
      toast.error(data.message);
    }
  });
  const PrepareFiles = ()=>{
    const f = [];
    const keys = Object.keys(files);
    for (const key of keys){
      f.push({
        path:key,
        content:files[key]
      })
    };
    return f
  }
  const fileTree = useCallback(()=>{
    const tree = parseFileTree(files);
    return tree
  },[files])()
  const getLanguage = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "tsx":
        return "typescript"
      case "jsx":
        return "javascript"
      case "ts":
        return "typescript"
      case "js":
        return "javascript"
      case "json":
        return "json"
      case "md":
        return "markdown"
      case "css":
        return "css"
      case "html":
        return "html"
      case "xml":
        return "xml"
      case "yaml":
      case "yml":
        return "yaml"
      default:
        return "text"
    }
  }

  const handleFileChange = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
    setIsEdited(true)
  }, [])

if(sandbox)
  return (
   <div className="w-full h-full relative  overflow-hidden flex ">
        <div className="w-[240px] h-full  overflow-auto">
          {fileTree.map((f,i)=><Data data={f} key={i} ActivePath={activeFile} onclick={setActiveFile}/>)}
        </div>
       {isEdited &&
        <div className="save absolute z-10  bottom-10 left-1/2 -translate-x-1/2  p-2 h-fit backdrop-blur-2xl shadow rounded-full  flex items-center gap-2">
          <Button
          disabled={isPending}
          onClick={()=>mutate({id:sandbox.id,files:PrepareFiles()})}
          className="rounded-full" size={'sm'}>{isPending ? "Saving...":"Save Changes"} </Button>
          <Button
          disabled={isPending}
           variant={'outline'} onClick={()=>{setFiles(initialFiles)}} size={'sm'} className="rounded-full">Discard</Button>
        </div>
       }
          {activeFile && files[activeFile] !== undefined ? (
            <CodeInput
              value={files[activeFile]}
              onChange={(content) => handleFileChange(activeFile, content)}
              language={getLanguage(activeFile)}
              path={activeFile}
            />
          ) : (
            <div className="flex items-center justify-center flex-1 h-full text-muted-foreground">
              <div className="text-center">
                <FileTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No file selected</p>
                <p className="text-sm">Create a new file to get started</p>
              </div>
            </div>
          )}
        </div>
  )
}
