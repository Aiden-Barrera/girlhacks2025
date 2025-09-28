FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy source code
COPY . .

# Install Python dependencies
RUN pip3 install --upgrade pip && \
    pip3 install strands-agents strands-agents-tools python-dotenv pymongo

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 3000

# Start backend server
CMD ["node", "backend/server.js"]
