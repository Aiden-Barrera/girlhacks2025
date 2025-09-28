FROM node:18

# Install Python with full package
RUN apt-get update && apt-get install -y python3-full python3-pip python3-venv

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy source code
COPY . .

# Create virtual environment and install Python dependencies
RUN python3 -m venv /opt/venv && \
    . /opt/venv/bin/activate && \
    pip install --upgrade pip && \
    pip install strands-agents strands-agents-tools python-dotenv pymongo

# Make sure venv is activated by default
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Build frontend
RUN cd frontend && npm run build

# Expose port
EXPOSE 3000

# Start backend server
CMD ["node", "backend/server.js"]
