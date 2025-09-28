#!/bin/bash
# Install Python and pip
apt-get update
apt-get install -y python3 python3-pip

# Install Python dependencies
pip3 install -r requirements.txt

# Install Node.js dependencies
cd backend
npm install
