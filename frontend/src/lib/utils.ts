import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const rootDomain = process.env.NODE_ENV==='development'?"localhost:3000":process.env.NEXT_PUBLIC_ROOT_DOMAIN 
export const protocol = process.env.NEXT_PUBLIC_PROTOCOL


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}