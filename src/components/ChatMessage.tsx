import React, { useEffect, useState, useRef } from "react";
import { cn, containsLaTeX } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

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
  const [processedContent, setProcessedContent] = useState<React.ReactNode[]>([]);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
    processMessageContent(content);
  }, [content]);

  const processMessageContent = (text: string) => {
    const segments = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);
    
    const renderedSegments: React.ReactNode[] = segments.map((segment, index) => {
      if (segment.startsWith('$$') && segment.endsWith('$$')) {
        const formula = segment.slice(2, -2);
        try {
          return (
            <div key={index} className="my-2 overflow-x-auto">
              <BlockMath math={formula} />
            </div>
          );
        } catch (error) {
          console.error("Error rendering block LaTeX:", error);
          return <code key={index}>{segment}</code>;
        }
      } else if (segment.startsWith('$') && segment.endsWith('$')) {
        const formula = segment.slice(1, -1);
        try {
          return <InlineMath key={index} math={formula} />;
        } catch (error) {
          console.error("Error rendering inline LaTeX:", error);
          return <code key={index}>{segment}</code>;
        }
      } else {
        const processedText = processMarkdown(segment);
        return (
          <span key={index} dangerouslySetInnerHTML={{ __html: processedText }} />
        );
      }
    });
    
    setProcessedContent(renderedSegments);
  };

  const processMarkdown = (text: string) => {
    let processedText = text.replace(/```(?:\w+)?\n([\s\S]*?)```/g, (match, code) => {
      return `<pre class="bg-muted p-2 rounded-md overflow-x-auto my-2"><code>${code}</code></pre>`;
    });
    
    processedText = processedText.replace(/`([^`]+)`/g, (match, code) => {
      return `<code class="bg-muted px-1 py-0.5 rounded">${code}</code>`;
    });
    
    processedText = processedText.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
      const level = hashes.length;
      const fontSize = 6 - level + 0.75; // h1 = 1.75rem, h2 = 1.5rem, etc.
      return `<h${level} class="text-${fontSize}xl font-bold mt-4 mb-2">${content}</h${level}>`;
    });
    
    processedText = processedText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    processedText = processedText.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    processedText = processedText.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4">$1</li>');
    
    processedText = processedText.replace(/^-\s+(.+)$/gm, '<li class="ml-4">• $1</li>');
    
    processedText = processedText.replace(/\n\n/g, '<p class="my-2"></p>');
    
    return processedText;
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
            <div className="m-0 text-balance leading-relaxed">
              {processedContent}
            </div>
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
