import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import requestLogger from './logging/requestLogger.js';
import responseLogger from './logging/responseLogger.js';
dotenv.config();

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
