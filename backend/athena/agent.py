from strands import Agent
# from strands_tools import calculator, current_time
from dotenv import load_dotenv
import os
import json
import requests

# Load environment variables from .env file
load_dotenv('../.env')

system_prompt = os.getenv("ATHENA_SYSTEM_PROMPT")

agent = Agent(
    system_prompt=system_prompt,
)

# Ask the agent a question that uses the available tools
message = os.getenv("USER_MESSAGE")

response = agent(message)
response_str = str(response)

# Find JSON boundaries
start = response_str.find('{')
end = response_str.rfind('}') + 1

json_str = response_str[start:end]
processedData = json.loads(json_str)

def parse_mermaid_from_llm(llm_output):
    """
    Accept the Roadmap Agent's output and parse out the mermaid code block into a string with proper syntax for Mermaid JS

    Args:
        llm_output (str): The output from the Roadmap Agent

    Returns:
        str: A parsed block of mermaid JS code
    """
    return llm_output.replace('\\n', '\n').replace('\\"', '"').strip()


response = requests.post('http://localhost:3000/api/pathways', json=processedData['outputs'])
print(response.text)
print(response.status_code)
