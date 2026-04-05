import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
export const protocol = process.env.NEXT_PUBLIC_PROTOCOL


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}