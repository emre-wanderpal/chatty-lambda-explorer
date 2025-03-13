
import React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export type MessageType = "user" | "ai";

interface ChatMessageProps {
  type: MessageType;
  content: string;
  isLoading?: boolean;
  images?: string[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  type, 
  content, 
  isLoading = false,
  images = []
}) => {
  // Convert markdown-style code blocks to HTML
  const processContent = (text: string) => {
    // Handle code blocks with ```
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const processedText = text.replace(codeBlockRegex, (match, code) => {
      return `<pre class="bg-muted p-2 rounded-md overflow-x-auto my-2"><code>${code}</code></pre>`;
    });
    
    // Handle inline code with `
    const inlineCodeRegex = /`([^`]+)`/g;
    return processedText.replace(inlineCodeRegex, (match, code) => {
      return `<code class="bg-muted px-1 py-0.5 rounded">${code}</code>`;
    });
  };

  return (
    <div 
      className={cn(
        "flex w-full items-start gap-4 p-4 animate-fade-up",
        type === "user" ? "justify-end" : "justify-start"
      )}
    >
      {type === "ai" && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
          <Bot className="h-4 w-4" />
        </div>
      )}
      
      <div 
        className={cn(
          "relative rounded-xl px-4 py-3 text-sm shadow-sm",
          type === "user" 
            ? "bg-chat-user text-chat-user-foreground" 
            : "bg-chat-ai text-chat-ai-foreground",
          isLoading && "min-h-[2.5rem] min-w-[6rem]"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-pulse-gentle"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-pulse-gentle delay-150"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 animate-pulse-gentle delay-300"></span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {images && images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <img 
                    key={index} 
                    src={`data:image/png;base64,${image}`} 
                    alt="User uploaded" 
                    className="max-h-40 rounded-md object-contain"
                  />
                ))}
              </div>
            )}
            <div 
              className="m-0 text-balance leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processContent(content) }}
            />
          </div>
        )}
      </div>
      
      {type === "user" && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};
