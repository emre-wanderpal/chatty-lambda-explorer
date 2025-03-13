
import React from "react";
import ChatContainer from "@/components/ChatContainer";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="mr-4 flex">
              <a className="mr-6 flex items-center space-x-2" href="/">
                <span className="font-bold">AI Chat with Ollama</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col">
          <div className="container flex-1 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-2xl h-[75vh] overflow-hidden rounded-xl border shadow-sm bg-card">
              <ChatContainer initialMessage="👋 Hello! I'm your AI assistant running on Ollama with Llama 3.1 8B. How can I help you today?" />
            </div>
          </div>
        </main>
        
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with Ollama and Llama 3.1 8B
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default Index;
