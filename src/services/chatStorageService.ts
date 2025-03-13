
import { ChatHistoryEntry } from "@/components/ChatHistory";
import { Message } from "@/components/ChatContainer";

export interface SavedChat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  context?: number[];
}

class ChatStorageService {
  private readonly STORAGE_KEY = "ollama_chat_history";

  saveChatHistory(chat: SavedChat): void {
    const chatHistory = this.getAllChats();
    
    // Update existing chat or add new one
    const existingIndex = chatHistory.findIndex(c => c.id === chat.id);
    if (existingIndex >= 0) {
      chatHistory[existingIndex] = chat;
    } else {
      chatHistory.push(chat);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(chatHistory));
  }

  getAllChats(): SavedChat[] {
    const chatHistoryJson = localStorage.getItem(this.STORAGE_KEY);
    if (!chatHistoryJson) return [];
    
    try {
      const chatHistory = JSON.parse(chatHistoryJson) as SavedChat[];
      return chatHistory;
    } catch (error) {
      console.error("Error parsing chat history:", error);
      return [];
    }
  }

  getChat(id: string): SavedChat | null {
    const chatHistory = this.getAllChats();
    return chatHistory.find(chat => chat.id === id) || null;
  }

  deleteChat(id: string): void {
    const chatHistory = this.getAllChats();
    const updatedHistory = chatHistory.filter(chat => chat.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
  }

  getChatHistoryEntries(): ChatHistoryEntry[] {
    const chatHistory = this.getAllChats();
    return chatHistory.map(chat => ({
      id: chat.id,
      title: chat.title,
      preview: chat.messages.length > 1 ? 
        chat.messages[chat.messages.length - 2].content.substring(0, 60) + "..." : 
        "Empty chat",
      createdAt: new Date(chat.createdAt)
    })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const chatStorageService = new ChatStorageService();
