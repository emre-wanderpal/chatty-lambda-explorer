
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced function to check if a string contains LaTeX with more comprehensive patterns
export function containsLaTeX(text: string): boolean {
  // Check for inline math delimited by single $
  const inlinePattern = /\$[^$\n]+?\$/g;
  
  // Check for block math delimited by double $$
  const blockPattern = /\$\$[\s\S]*?\$\$/g;
  
  // Check for common LaTeX commands like \frac, \sum, \int, etc.
  const commandPattern = /\\(frac|sum|int|sqrt|alpha|beta|gamma|delta|theta|lambda|pi|sigma|omega|infty|partial|nabla)/g;
  
  return inlinePattern.test(text) || blockPattern.test(text) || commandPattern.test(text);
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
