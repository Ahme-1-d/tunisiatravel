import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store active chat sessions
const activeChats = new Map();

// HTTP endpoint for n8n to send messages
app.post('/api/receive-message', (req, res) => {
  console.log('Received POST request to /api/receive-message');
  console.log('Request body:', req.body);
  
  try {
    const { message, sender = 'bot', chatId } = req.body;
    
    if (!message || !chatId) {
      console.log('Missing message or chatId');
      return res.status(400).json({ error: 'Missing message or chatId' });
    }

    // Store the message for the chat session
    if (!activeChats.has(chatId)) {
      activeChats.set(chatId, []);
      console.log(`Created new chat session for ${chatId}`);
    }
    
    const chatMessages = activeChats.get(chatId);
    const newMessage = {
      chat_id: chatId,
      message: message,
      sender: sender,
      created_at: new Date().toISOString(),
    };
    
    chatMessages.push(newMessage);
    
    console.log(`Message received for chat ${chatId}:`, newMessage);
    console.log(`Total messages for chat ${chatId}:`, chatMessages.length);
    
    res.json({ 
      success: true, 
      message: 'Message received',
      chatId: chatId 
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get messages for a specific chat
app.get('/api/chat/:chatId/messages', (req, res) => {
  const { chatId } = req.params;
  console.log(`GET request for chat ${chatId} messages`);
  
  const messages = activeChats.get(chatId) || [];
  console.log(`Returning ${messages.length} messages for chat ${chatId}:`, messages);
  
  res.json({ messages });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', activeChats: activeChats.size });
});

app.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
  console.log(`n8n can send messages to: http://localhost:${PORT}/api/receive-message`);
}); 