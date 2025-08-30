import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Update ChatMessage interface to match actual table schema
interface ChatMessage {
  chat_id: string;
  message: string;
  sender: string;
  created_at: string; // keep as string for now
}

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const webhookUrl =
    "https://gorgeous-egret-smart.ngrok-free.app/webhook/3a31f0b7-ba10-4d4d-b72b-9d5c55399889";
  const { toast } = useToast();

  // Generate a fresh chat session ID on each page load
  const chatId = useMemo(() => crypto.randomUUID(), []);

  // Show welcome message on first render
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: ChatMessage = {
        chat_id: "init",
        message: "Hi! What's your name?",
        sender: "bot",
        created_at: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, [messages]);

  // Function to receive messages from n8n via HTTP
  const receiveMessageFromN8n = (message: string, sender: string = 'bot') => {
    const newMessage: ChatMessage = {
      chat_id: chatId,
      message: message,
      sender: sender,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Poll for new messages from the server and display them in chat UI
  useEffect(() => {
    console.log('Starting to poll for messages with chatId:', chatId);
    
    const pollInterval = setInterval(async () => {
      try {
        console.log('Polling for messages...');
        const response = await fetch(`http://localhost:3001/api/chat/${chatId}/messages`);
        console.log('Poll response status:', response.status);
        
        if (response.ok) {
          const { messages } = await response.json();
          console.log('Received messages from server:', messages);
          console.log('Current local messages count:', messages.length);
          
          // Merge server messages with local messages to keep conversation history
          if (messages.length > 0) {
            setMessages((prevMessages) => {
              // Create a map of existing messages to avoid duplicates
              const existingMessages = new Map();
              prevMessages.forEach(msg => {
                const key = `${msg.message}-${msg.created_at}`;
                existingMessages.set(key, msg);
              });
              
              // Add new messages from server
              messages.forEach(msg => {
                const key = `${msg.message}-${msg.created_at}`;
                if (!existingMessages.has(key)) {
                  existingMessages.set(key, msg);
                }
              });
              
              // Convert back to array and sort by timestamp
              const mergedMessages = Array.from(existingMessages.values());
              mergedMessages.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              
              console.log('Merged messages count:', mergedMessages.length);
              
              // If we received new messages from server, stop waiting for response
              if (mergedMessages.length > prevMessages.length) {
                setWaitingForResponse(false);
              }
              
              return mergedMessages;
            });
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      chat_id: chatId,
      message: inputMessage,
      sender: "user",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setWaitingForResponse(true);

    try {
      // 1. Send to n8n webhook
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          answer: inputMessage,
        }),
      });

      // 2. Save user message in Supabase (optional but good practice)
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setWaitingForResponse(false);
    }

    setInputMessage("");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-chat-bg">
      {/* Header */}
      <div className="bg-gradient-hero shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Homepage</span>
          </Link>
          <div className="flex items-center space-x-2 text-white">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold">Tunisia Travel Assistant</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={message.chat_id + message.created_at + idx}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm leading-relaxed">
                    {message.message}
                  </p>
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(message.created_at).toLocaleTimeString()} - {message.sender}
                  </p>
                </div>
              </div>
            ))}

            {(isLoading || waitingForResponse) && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isLoading ? "Sending..." : "Waiting for response..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your answer here..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
                disabled={isLoading || waitingForResponse}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || waitingForResponse || !inputMessage.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              I’ll ask for your name, email, cities, travel dates, and contact
              info.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;
