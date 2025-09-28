import json
import os
from datetime import datetime
from pymongo import MongoClient
from strands import Agent

def lambda_handler(event, context):
    try:
        # Parse input from API Gateway or direct invoke
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event
        
        # Get data from request
        system_prompt = body.get('system_prompt', '')
        user_message = body.get('user_message', '')
        session_id = body.get('session_id', '')
        user_id = body.get('user_id', '')
        mongodb_url = body.get('mongodb_url', '')
        db_name = body.get('db_name', '')

        if not user_message:
            raise ValueError("USER_MESSAGE not provided")

        if not session_id or not user_id:
            raise ValueError("SESSION_ID or USER_ID not provided")

        # Initialize agent
        agent = Agent(system_prompt=system_prompt)

        # Process user message
        response = agent(user_message)
        response_str = str(response)

        # Remove markdown code block markers if present
        if response_str.strip().startswith('```json'):
            response_str = response_str.strip()[7:]  # Remove ```json
        if response_str.strip().endswith('```'):
            response_str = response_str.strip()[:-3]  # Remove ```

        # Find JSON boundaries
        start = response_str.find('{')
        end = response_str.rfind('}') + 1

        if start == -1 or end == 0:
            raise ValueError("No valid JSON found in agent response")

        json_str = response_str[start:end]
        try:
            processedData = json.loads(json_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse JSON - {e}")

        # Connect to MongoDB and save to pathways collection
        client = MongoClient(mongodb_url)
        db = client[db_name]
        
        # Delete existing pathways for this user
        db.pathways.delete_many({"user_id": user_id})
        
        # Create pathway document
        pathway_doc = {
            "user_id": user_id,
            "pathway": processedData.get('outputs', {}).get('storage', {}).get('pathway', processedData),
            "mermaid": processedData.get('outputs', {}).get('visualization', {}).get('mermaid', "")
        }
        
        # Insert into pathways collection
        result = db.pathways.insert_one(pathway_doc)
        client.close()
        
        if result.inserted_id:
            return {
                "statusCode": 201,
                "body": json.dumps({
                    "status": "success",
                    "message": "Pathway saved successfully"
                })
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps({
                    "status": "error", 
                    "message": "Failed to save pathway"
                })
            }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "status": "error",
                "message": str(e)
            })
        }
