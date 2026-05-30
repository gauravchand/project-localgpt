import fs from 'fs';
import path from 'path';
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

interface ServerDB {
  sessions: ChatSession[];
  messages: Message[];
}

class ServerDatabaseManager {
  private dbPath: string;
  private db: ServerDB;

  constructor() {
    this.dbPath = path.join(process.cwd(), '.data', 'database.json');
    this.db = { sessions: [], messages: [] };
    this.loadFromFile();
  }

  private ensureDir(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadFromFile(): void {
    try {
      this.ensureDir();
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        this.db = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading database from file:', error);
    }
  }

  private saveToFile(): void {
    try {
      this.ensureDir();
      fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2));
    } catch (error) {
      console.error('Error saving database to file:', error);
    }
  }

  createSession(title: string = 'New Chat'): ChatSession {
    const session: ChatSession = {
      id: uuidv4(),
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.db.sessions.push(session);
    this.saveToFile();
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
      this.saveToFile();
    }
  }

  deleteSession(id: string): void {
    this.db.sessions = this.db.sessions.filter(session => session.id !== id);
    this.db.messages = this.db.messages.filter(message => message.session_id !== id);
    this.saveToFile();
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
    
    this.saveToFile();
    return message;
  }

  getMessages(sessionId: string): Message[] {
    return this.db.messages
      .filter(message => message.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

// Singleton instance
let dbInstance: ServerDatabaseManager | null = null;

export function getServerDatabase(): ServerDatabaseManager {
  if (!dbInstance) {
    dbInstance = new ServerDatabaseManager();
  }
  return dbInstance;
}
