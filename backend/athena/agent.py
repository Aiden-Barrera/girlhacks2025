from strands import Agent, tool
# from strands_tools import calculator, current_time
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv('../.env')

system_prompt = os.getenv("ATHENA_SYSTEM_PROMPT")

agent = Agent(
    system_prompt=system_prompt,
)

# Ask the agent a question that uses the available tools
message = """
Hey I'm a complete beginner, how do I become a data scientist?
"""

agent(message)