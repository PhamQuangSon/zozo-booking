"use client";

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
  restaurantId: number;
  tableId?: number;
  onOrderUpdated?: () => void;
}

export function ChatWidget({ restaurantId, tableId, onOrderUpdated }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      restaurantId,
      tableId,
    },
    onError: (e) => {
      console.error("Chat error:", e);
    }
  });

  // Watch for successful order_food tool invocations to trigger a refetch
  useEffect(() => {
    if (!onOrderUpdated || messages.length === 0) return;
    
    // Check if any message contains a completed order_food tool
    const hasNewOrder = messages.some(m => 
      m.toolInvocations?.some(t => t.toolName === 'order_food' && t.state === 'result')
    );
    
    // We only want to trigger this when a new order happens, but to avoid infinite loops,
    // we should ideally track the length or just trigger it when the last message completes.
    // For simplicity, if the AI just finished talking and there's an order tool in the history
    // (We can just use refetch() which is safe to call multiple times as React Query dedupes it)
    if (hasNewOrder && !isLoading) {
      onOrderUpdated();
    }
  }, [messages, isLoading, onOrderUpdated]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-xl transition-transform hover:scale-110 z-50 p-0"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-[350px] sm:w-[400px] h-[500px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-primary p-4 flex items-center justify-between text-primary-foreground">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground hover:bg-primary/90 h-8 w-8 rounded-full"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 pt-10">
            <Bot className="h-12 w-12 opacity-50" />
            <p>Hi! I'm here to help you choose what to eat. What are you in the mood for?</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map(m => (
              <div 
                key={m.id} 
                className={cn(
                  "flex gap-3 text-sm",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}>
                  {m.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                
                <div className={cn(
                  "px-4 py-2 rounded-2xl max-w-[80%]",
                  m.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-muted rounded-tl-sm"
                )}>
                  <div className={cn("prose prose-sm dark:prose-invert max-w-none break-words", m.role === 'user' ? 'text-primary-foreground' : '')}>
                    <ReactMarkdown 
                      components={{
                        a: ({node, ...props}) => <a {...props} className="font-semibold underline underline-offset-4 hover:opacity-80" target="_blank" rel="noopener noreferrer" />
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 text-sm flex-row">
                 <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="px-4 py-2 rounded-2xl bg-muted rounded-tl-sm flex gap-1 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-bounce" />
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-md">
                {error.message || "Sorry, there was an error processing your request. Please try again."}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-background border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-full"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
