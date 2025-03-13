
import React from "react";
import { Button } from "@/components/ui/button";
import { History, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ChatHistoryEntry {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
}

interface ChatHistoryProps {
  chatHistory: ChatHistoryEntry[];
  onChatSelect: (chatId: string) => void;
  onChatDelete: (chatId: string) => void;
  currentChatId: string | null;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatHistory,
  onChatSelect,
  onChatDelete,
  currentChatId,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" title="Chat history">
          <History className="h-4 w-4" />
          <span className="sr-only">Chat history</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Chat History</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[80vh] pr-4 mt-4">
          {chatHistory.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              No saved chats
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors group relative ${
                    chat.id === currentChatId ? "bg-accent" : ""
                  }`}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <div className="font-medium truncate">{chat.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {chat.preview}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {chat.createdAt.toLocaleString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChatDelete(chat.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Delete chat</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ChatHistory;
