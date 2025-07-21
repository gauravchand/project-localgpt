'use client';

import { memo } from 'react';
import { ChatMessage } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { User, Bot, Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatMessageComponent = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  return (
    <div
      className={cn(
        'group relative flex items-start space-x-4 p-4 hover:bg-muted/30 transition-colors',
        isUser ? 'bg-background' : 'bg-muted/20'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm',
          isUser 
            ? 'bg-background' 
            : 'bg-primary text-primary-foreground'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div
          className={cn(
            'prose prose-sm max-w-none break-words',
            'prose-p:leading-relaxed prose-pre:p-0',
            isUser 
              ? 'text-foreground'
              : 'text-foreground/90'
          )}
        >
          {message.content ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : isStreaming ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : null}
          
          {isStreaming && message.content && (
            <div className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
          )}
        </div>

        {/* Message Metadata */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

ChatMessageComponent.displayName = 'ChatMessage';