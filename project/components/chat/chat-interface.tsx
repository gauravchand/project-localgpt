'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useSessions } from '@/hooks/use-sessions';
import { ChatMessageComponent } from './chat-message';
import { ChatInput } from './chat-input';
import { Sidebar } from './sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MessageSquare, Zap } from 'lucide-react';

export function ChatInterface() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [latestUserMessage, setLatestUserMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const isInitializingRef = useRef(false);
  
  const {
    sessions,
    isLoading: sessionsLoading,
    createSession,
    deleteSession,
    updateSessionTitle,
  } = useSessions();

  const {
    messages,
    isLoading,
    sendMessage,
    stopGeneration,
    loadMessages,
  } = useChat(currentSessionId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId);
    }
  }, [currentSessionId, loadMessages]);

  // Initialize chat after sessions have loaded
  useEffect(() => {
    if (isInitialized.current || sessionsLoading || isInitializingRef.current) return;
    
    isInitializingRef.current = true;
    
    if (sessions.length === 0) {
      createSession().then(newSession => {
        if (newSession) {
          setCurrentSessionId(newSession.id);
        }
        isInitialized.current = true;
      });
    } else {
      setCurrentSessionId(sessions[0].id);
      isInitialized.current = true;
    }
  }, [sessionsLoading]);

  const handleNewChat = async () => {
    const newSession = await createSession();
    if (newSession) {
      setLatestUserMessage('');
      setCurrentSessionId(newSession.id);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    
    // If we deleted the current session, switch to another or create new
    if (sessionId === currentSessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
      } else {
        setCurrentSessionId(null);
        handleNewChat();
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    
    if (!currentSessionId) {
      await handleNewChat();
      
      setLatestUserMessage(message);
      // Wait a bit for the session to be created
      setTimeout(() => sendMessage(message), 100);
    } else {
      setLatestUserMessage(message);
      sendMessage(message);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onUpdateSessionTitle={updateSessionTitle}
        latestMessage={latestUserMessage}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Messages */}
        <ScrollArea className="flex-1">
          {isEmpty ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md mx-auto p-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Welcome to Local Chat</h3>
                  <p className="text-muted-foreground">
                    Start a conversation with the Gemma 1B model running locally via Ollama.
                    Your chat sessions are stored locally and completely private.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span>Powered by Ollama + Gemma 1B</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((message) => (
                <ChatMessageComponent key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={stopGeneration}
          isLoading={isLoading}
          disabled={!currentSessionId && sessions.length === 0}
        />
      </div>
    </div>
  );
}