import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
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

app.get('/test', async (req, res) => {
  const users = await db.collection('users').find({}).toArray();

  return res.status(200).json({"pathway": users[0].pathway});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
