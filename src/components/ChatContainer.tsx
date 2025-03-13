
import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, MessageType } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  type: MessageType;
  content: string;
}

interface ChatContainerProps {
  initialMessage?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  initialMessage = "How can I help you today?"
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mock AI response - in a real app this would call an API
  const mockAiResponse = async (message: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple response logic
    if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      return "Hello! How can I assist you today?";
    }
    
    if (message.toLowerCase().includes("help")) {
      return "I'm here to help! You can ask me questions, and I'll do my best to provide answers.";
    }
    
    if (message.toLowerCase().includes("thank")) {
      return "You're welcome! Is there anything else you'd like to know?";
    }
    
    // Default responses for demo
    const responses = [
      "That's an interesting question. Let me think about that for a moment.",
      "I'm an AI assistant designed to help with a wide range of topics. What would you like to know more about?",
      "I'm still learning, but I'll do my best to assist you with that query.",
      "Thank you for your question. Is there any specific aspect of this topic you'd like me to elaborate on?",
      "I understand what you're asking. Here's what I know about that subject."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Create loading message
    const loadingId = (Date.now() + 1).toString();
    setLoadingId(loadingId);
    setIsLoading(true);

    try {
      const response = await mockAiResponse(content);
      
      // Replace loading message with actual response
      const aiMessage: Message = {
        id: loadingId,
        type: "ai",
        content: response
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
      setLoadingId(null);
    }
  };

  const resetChat = () => {
    setMessages([]);
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with AI welcome message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          type: "ai",
          content: initialMessage
        }
      ]);
    }
  }, [initialMessage, messages.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-medium">AI Chat</h2>
        <Button variant="ghost" size="icon" onClick={resetChat} title="Reset chat">
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Reset chat</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            type={message.type}
            content={message.content}
          />
        ))}
        
        {isLoading && (
          <ChatMessage
            key={loadingId}
            type="ai"
            content=""
            isLoading={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default ChatContainer;
