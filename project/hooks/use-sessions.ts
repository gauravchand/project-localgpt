'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatSession } from '@/lib/database';

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      
      if (response.ok) {
        setSessions(data);
      } else {
        console.error('Failed to load sessions:', data.error);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSession = useCallback(async (title?: string) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSessions(prev => [data, ...prev]);
        return data;
      } else {
        console.error('Failed to create session:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      } else {
        console.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, []);

  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (response.ok) {
        setSessions(prev => 
          prev.map(session => 
            session.id === sessionId 
              ? { ...session, title }
              : session
          )
        );
      } else {
        console.error('Failed to update session title');
      }
    } catch (error) {
      console.error('Error updating session title:', error);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    isLoading,
    createSession,
    deleteSession,
    updateSessionTitle,
    refreshSessions: loadSessions,
  };
}