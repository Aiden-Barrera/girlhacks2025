import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { WebSocketServer } from 'ws';
import requestLogger from './logging/requestLogger.js';
import responseLogger from './logging/responseLogger.js';
dotenv.config();

const app = express();
const port = 3000;

// MongoDB connection
const mongoUrl = process.env.MONGODB_URL;
const dbName = process.env.DB_NAME;
let db;

MongoClient.connect(mongoUrl)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(error => console.error('MongoDB connection error:', error));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 100 requests per minute
  message: 'Too many requests from this IP, please try again.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

app.use(limiter); // Apply general rate limiting to all requests
app.use(requestLogger); // Log all api requests
app.use(cookieParser());
app.use(express.json({ limit: '1mb' })); // Limit request body size to 1MB to tame payload sizes for DoS prevention


app.get('/', (req, res) => {
  return res.status(200).json({"Welcome":"Hello World!"});
});

app.get('/users', async (req, res) => {
  try {
    const uname = req.body.username;
    if (!uname) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const users = await db.collection('users').find({username: uname}, { projection: { username: 1, email: 1, _id: 0 } }).toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/test', async (req, res) => {
  const users = await db.collection('users').find().toArray();

  return res.status(200).json({"pathway": users});
});

// Send friend request
app.post('/friend-request', async (req, res) => {
  try {
    const { senderUsername, senderEmail, receiverUsername, receiverEmail } = req.body;
    
    await db.collection('users').updateOne(
      { username: receiverUsername, email: receiverEmail },
      { 
        $push: { 
          friends: { 
            username: senderUsername, 
            email: senderEmail, 
            accepted: false,
            timestamp: new Date()
          } 
        },
        $set: { updatedAt: new Date() }
      }
    );

    triggerWebhook(receiverUsername, receiverEmail);
    res.json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept friend request
app.post('/accept-friend', async (req, res) => {
  try {
    const { accepterUsername, accepterEmail, requesterUsername, requesterEmail } = req.body;
    
    await db.collection('users').updateOne(
      { 
        username: accepterUsername, 
        email: accepterEmail,
        'friends.username': requesterUsername,
        'friends.email': requesterEmail
      },
      { 
        $set: { 
          'friends.$.accepted': true,
          updatedAt: new Date()
        } 
      }
    );

    await db.collection('users').updateOne(
      { username: requesterUsername, email: requesterEmail },
      { 
        $push: { 
          friends: { 
            username: accepterUsername, 
            email: accepterEmail, 
            accepted: true,
            timestamp: new Date()
          } 
        },
        $set: { updatedAt: new Date() }
      }
    );

    triggerWebhook(accepterUsername, accepterEmail);
    triggerWebhook(requesterUsername, requesterEmail);
    res.json({ success: true, message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get friends list
app.get('/friends/:username/:email', async (req, res) => {
  try {
    const { username, email } = req.params;
    const user = await db.collection('users').findOne({ username, email }, { projection: { friends: 1, _id: 0 } });
    res.json({ friends: user?.friends || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint
app.post('/webhook/friends-update', (req, res) => {
  const { username, email, friendsData } = req.body;
  console.log(`Webhook: Sending updated friends data to ${username} (${email})`);
  
  // In real implementation, this would push to WebSocket, SSE, or frontend polling endpoint
  // For now, we'll log the data that would be sent to frontend
  console.log('Updated friends data:', friendsData);
  
  res.json({ received: true, friendsData });
});

async function triggerWebhook(username, email) {
  try {
    const user = await db.collection('users').findOne({ username, email }, { projection: { friends: 1, _id: 0 } });
    const friendsData = user?.friends || [];
    
    // Send via WebSocket to connected client
    const key = `${username}:${email}`;
    const client = clients.get(key);
    
    if (client && client.readyState === client.OPEN) {
      client.send(JSON.stringify({
        type: 'friends_update',
        friendsData
      }));
      console.log(`WebSocket update sent to ${username}`);
    }
  } catch (error) {
    console.log('WebSocket trigger error:', error.message);
  }
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// WebSocket server
const wss = new WebSocketServer({ port: 8080 });
const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'register') {
      const key = `${data.username}:${data.email}`;
      clients.set(key, ws);
      console.log(`WebSocket client registered: ${key}`);
    }
  });

  ws.on('close', () => {
    for (const [key, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(key);
        console.log(`WebSocket client disconnected: ${key}`);
        break;
      }
    }
  });
});
