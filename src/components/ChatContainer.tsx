import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, MessageType } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ImageUploadButton from "./ImageUploadButton";
import DocumentUploadButton from "./DocumentUploadButton";
import ChatHistory, { ChatHistoryEntry } from "./ChatHistory";
import { ollamaService } from "@/services/ollamaService";
import { chatStorageService, SavedChat } from "@/services/chatStorageService";

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  images?: string[];
}

interface ChatContainerProps {
  initialMessage?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  initialMessage = "How can I help you today?"
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentContext, setCurrentContext] = useState<number[] | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryEntry[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load chat history on component mount
  useEffect(() => {
    refreshChatHistory();
  }, []);

  const refreshChatHistory = () => {
    const entries = chatStorageService.getChatHistoryEntries();
    setChatHistory(entries);
  };

  // Convert a file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Extract only the base64 part, removing the prefix like "data:image/jpeg;base64,"
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSendMessage = async (content: string) => {
    // If there's no content and no pending image, don't send
    if (content.trim() === "" && !pendingImage) return;

    // Create user message
    const userMessageImages: string[] = [];
    
    // If there's a pending image, process it
    if (pendingImage) {
      try {
        const base64Image = await fileToBase64(pendingImage);
        userMessageImages.push(base64Image);
      } catch (error) {
        console.error("Error converting image to base64:", error);
        toast({
          title: "Error processing image",
          description: "There was an error preparing your image for upload.",
          variant: "destructive"
        });
      }
      setPendingImage(null);
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      ...(userMessageImages.length > 0 && { images: userMessageImages })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsSaved(false);
    
    // Create loading message
    const loadingId = (Date.now() + 1).toString();
    setLoadingId(loadingId);
    setIsLoading(true);

    try {
      let responseText = "";
      let newContext: number[] | undefined;
      
      // Assuming you always want to send the most recent image for context
      const imagesToSend = userMessageImages.length > 0 ? 
        userMessageImages : 
        (images.length > 0 ? [images[images.length - 1]] : []);
      
      // Keep track of generated text to update the UI
      await ollamaService.generateStreamResponse(
        content,
        imagesToSend,
        (chunk) => {
          setMessages(prev => {
            // Find if the AI response message already exists
            const aiMessageIndex = prev.findIndex(msg => msg.id === loadingId);
            
            if (aiMessageIndex >= 0) {
              // Update the existing message
              const updatedMessages = [...prev];
              updatedMessages[aiMessageIndex] = {
                ...updatedMessages[aiMessageIndex],
                content: responseText + chunk,
              };
              return updatedMessages;
            } else {
              // Add new AI response message
              return [
                ...prev,
                {
                  id: loadingId,
                  type: "ai",
                  content: chunk,
                }
              ];
            }
          });
          
          responseText += chunk;
        },
        (fullResponse, context) => {
          // Update with the complete response once finished
          newContext = context;
          setCurrentContext(context);
        },
        currentContext
      );
      
      // If user uploaded an image, keep it for context
      if (userMessageImages.length > 0) {
        setImages(prev => [...prev, ...userMessageImages]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get response from Ollama. Is the service running locally?",
        variant: "destructive"
      });
      
      // Remove the loading message in case of error
      setMessages(prev => prev.filter(msg => msg.id !== loadingId));
    } finally {
      setIsLoading(false);
      setLoadingId(null);
    }
  };

  const handleImageUpload = (file: File) => {
    setPendingImage(file);
    toast({
      title: "Image selected",
      description: "Type a message and press send to include this image in your message.",
    });
  };

  const handleDocumentUpload = (file: File) => {
    // In a real app, this would process and extract text from the document
    toast({
      title: "Document processing",
      description: "Reading content from: " + file.name,
    });
    
    // Simplified for this demo - just show file name in the chat
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = `I've uploaded a document: ${file.name}. Please help me with this document.`;
      handleSendMessage(content);
    };
    reader.readAsText(file);
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentContext(undefined);
    setImages([]);
    setPendingImage(null);
    setIsSaved(false);
  };

  const saveChat = () => {
    if (messages.length <= 1) {
      toast({
        title: "Cannot save empty chat",
        description: "Please have at least one conversation before saving.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate a title from the first user message
    const firstUserMsg = messages.find(msg => msg.type === "user");
    const title = firstUserMsg 
      ? firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "")
      : "New Chat";
    
    const chatId = currentChatId || Date.now().toString();
    
    const chatToSave: SavedChat = {
      id: chatId,
      title,
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      context: currentContext
    };
    
    chatStorageService.saveChatHistory(chatToSave);
    setCurrentChatId(chatId);
    setIsSaved(true);
    refreshChatHistory();
    
    toast({
      title: "Chat saved",
      description: "Your conversation has been saved successfully.",
    });
  };

  const loadChat = (chatId: string) => {
    const chat = chatStorageService.getChat(chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setCurrentContext(chat.context);
      setIsSaved(true);
      
      // Extract images from the loaded chat
      const chatImages: string[] = [];
      chat.messages.forEach(msg => {
        if (msg.images && msg.images.length > 0) {
          chatImages.push(...msg.images);
        }
      });
      setImages(chatImages);
      
      toast({
        title: "Chat loaded",
        description: "Loaded saved conversation.",
      });
    }
  };

  const deleteChat = (chatId: string) => {
    chatStorageService.deleteChat(chatId);
    refreshChatHistory();
    
    if (currentChatId === chatId) {
      resetChat();
    }
    
    toast({
      title: "Chat deleted",
      description: "The conversation has been removed.",
    });
  };

  const startNewChat = () => {
    if (messages.length > 1 && !isSaved) {
      // Ask if user wants to save current chat
      if (window.confirm("Do you want to save the current chat before starting a new one?")) {
        saveChat();
      }
    }
    
    resetChat();
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
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={startNewChat} 
            title="New chat"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New chat</span>
          </Button>
          <ChatHistory 
            chatHistory={chatHistory}
            onChatSelect={loadChat}
            onChatDelete={deleteChat}
            currentChatId={currentChatId}
          />
          <h2 className="text-lg font-medium">
            {currentChatId ? (
              chatHistory.find(c => c.id === currentChatId)?.title || "AI Chat"
            ) : (
              "AI Chat"
            )}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={saveChat} 
            disabled={messages.length <= 1 || isSaved}
            title="Save chat"
          >
            <Save className="h-4 w-4" />
            <span className="sr-only">Save chat</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={resetChat} 
            title="Reset chat"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Reset chat</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            type={message.type}
            content={message.content}
            isLoading={loadingId === message.id && isLoading}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageUploadButton 
            onImageUpload={handleImageUpload} 
            disabled={isLoading}
          />
          <DocumentUploadButton 
            onDocumentUpload={handleDocumentUpload} 
            disabled={isLoading}
          />
          {pendingImage && (
            <div className="text-xs text-muted-foreground">
              Image selected: {pendingImage.name}
            </div>
          )}
        </div>
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
