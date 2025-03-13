
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to check if a string contains LaTeX
export function containsLaTeX(text: string): boolean {
  return /\$(.*?)\$/.test(text) || /\$\$(.*?)\$\$/.test(text);
}

// Function to simulate a typing delay for more natural text streaming
export function createTypingDelay(speed: 'slow' | 'medium' | 'fast' = 'medium'): number {
  const delays = {
    slow: 120,
    medium: 60,
    fast: 30
  };
  
  return delays[speed];
}
