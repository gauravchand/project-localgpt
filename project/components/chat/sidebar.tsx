'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { ChatSession } from '@/lib/database';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSessionTitle: (sessionId: string, title: string) => void;
  className?: string;
  latestMessage?: string;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession,
  onUpdateSessionTitle,
  className,
  latestMessage,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  useEffect(() => {
    if (latestMessage && currentSessionId) {
      const currentSession = sessions.find(s => s.id === currentSessionId);
      if (currentSession?.title === 'New Chat') {
        // Create a shorter title from the message
        const newTitle = latestMessage.length > 40 
          ? `${latestMessage.substring(0, 40)}...`
          : latestMessage;
        onUpdateSessionTitle(currentSessionId, newTitle);
      }
    }
  }, [latestMessage, currentSessionId, sessions, onUpdateSessionTitle]);
    
  const handleStartEdit = (session: ChatSession) => {
    setEditingSession(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (editingTitle.trim()) {
      onUpdateSessionTitle(sessionId, editingTitle.trim());
    }
    setEditingSession(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditingTitle('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-muted/20 transition-all duration-300',
        isCollapsed ? 'w-14' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <h2 className="font-semibold text-sm">Chat Sessions</h2>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className={cn(
            'w-full justify-start gap-3',
            isCollapsed ? 'px-3' : 'px-4'
          )}
          variant="default"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && 'New Chat'}
        </Button>
      </div>

      <Separator />

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {sessions.map((session) => {
            const isActive = session.id === currentSessionId;
            const isEditing = editingSession === session.id;

            return (
              <div
                key={session.id}
                className={cn(
                  'group relative flex items-center rounded-lg transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/60',
                  isCollapsed ? 'justify-center p-2' : 'p-2'
                )}
              >
                {isEditing ? (
                  <div className="flex items-center space-x-2 w-full">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(session.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      className="flex-1 h-6 text-sm"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSaveEdit(session.id)}
                      className="h-6 w-6 shrink-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="h-6 w-6 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => onSessionSelect(session.id)}
                      className={cn(
                        'flex-1 justify-start gap-3 h-auto p-2',
                        isCollapsed && 'px-0'
                      )}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      {!isCollapsed && (
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-medium truncate">
                            {session.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(session.updated_at)}
                          </div>
                        </div>
                      )}
                    </Button>

                    {!isCollapsed && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStartEdit(session)}
                          className="h-6 w-6 shrink-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDeleteSession(session.id)}
                          className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {sessions.length === 0 && !isCollapsed && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No chat sessions yet.
              <br />
              Start a new conversation!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}