// Using a simple in-memory database for WebContainer compatibility
// In production, replace this with PostgreSQL or better-sqlite3
import { v4 as uuidv4 } from 'uuid';

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Simple in-memory database for WebContainer compatibility
interface InMemoryDB {
  sessions: ChatSession[];
  messages: Message[];
}

class DatabaseManager {
  private db: InMemoryDB;

  constructor() {
    this.db = {
      sessions: [],
      messages: []
    };
  }

  createSession(title: string = 'New Chat'): ChatSession {
    const session: ChatSession = {
      id: uuidv4(),
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.db.sessions.push(session);
    return session;
  }

  getSessions(): ChatSession[] {
    return this.db.sessions.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  getSession(id: string): ChatSession | null {
    return this.db.sessions.find(session => session.id === id) || null;
  }

  updateSessionTitle(id: string, title: string): void {
    const session = this.db.sessions.find(s => s.id === id);
    if (session) {
      session.title = title;
      session.updated_at = new Date().toISOString();
    }
  }

  deleteSession(id: string): void {
    this.db.sessions = this.db.sessions.filter(session => session.id !== id);
    this.db.messages = this.db.messages.filter(message => message.session_id !== id);
  }

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Message {
    const message: Message = {
      id: uuidv4(),
      session_id: sessionId,
      role,
      content,
      created_at: new Date().toISOString()
    };

    this.db.messages.push(message);
    
    // Update session timestamp
    const session = this.db.sessions.find(s => s.id === sessionId);
    if (session) {
      session.updated_at = new Date().toISOString();
    }
    
    return message;
  }

  getMessages(sessionId: string): Message[] {
    return this.db.messages
      .filter(message => message.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

// Singleton instance
let dbInstance: DatabaseManager | null = null;

export function getDatabase(): DatabaseManager {
  if (!dbInstance) {
    dbInstance = new DatabaseManager();
  }
  return dbInstance;
}