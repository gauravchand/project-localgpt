export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { getLLMClient } from '@/lib/llm-client';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();
    
    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const llmClient = getLLMClient();

    // Save user message
    db.addMessage(sessionId, 'user', message);

    // Get conversation history
    const messages = db.getMessages(sessionId);
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let assistantMessage = '';
        let isClosed = false;
        
        try {
          const abortController = new AbortController();
          
          // Handle client disconnect
          request.signal.addEventListener('abort', () => {
            abortController.abort();
            if (!isClosed) {
              isClosed = true;
              controller.close();
            }
          });

          for await (const chunk of llmClient.generateStream(
            conversationHistory,
            abortController.signal
          )) {
            if (chunk.done || isClosed) {
              // Save the complete assistant message
              if (assistantMessage.trim()) {
                db.addMessage(sessionId, 'assistant', assistantMessage);
              }
              if (!isClosed) {
                isClosed = true;
                controller.close();
              }
              break;
            }

            assistantMessage += chunk.content;
            
            // Send chunk to client
            if (!isClosed && chunk.content) {
              const data = JSON.stringify({
                content: chunk.content,
                done: false,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
        } catch (error) {
          console.error('Error in chat stream:', error);
          if (!isClosed) {
            isClosed = true;
            controller.error(error);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}