import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatPrettyDate = (date: Date) => {
  return format(date, "dd/MM/yy 'at' h:mm a")
}
