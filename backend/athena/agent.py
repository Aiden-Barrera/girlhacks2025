from strands import Agent, tool
# from strands_tools import calculator, current_time
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv('../.env')

# Define a custom tool as a Python function using the @tool decorator
# @tool
# def letter_counter(word: str, letter: str) -> int:
#     """
#     Count occurrences of a specific letter in a word.

#     Args:
#         word (str): The input word to search in
#         letter (str): The specific letter to count

#     Returns:
#         int: The number of occurrences of the letter in the word
#     """
#     if not isinstance(word, str) or not isinstance(letter, str):
#         return 0

#     if len(letter) != 1:
#         raise ValueError("The 'letter' parameter must be a single character")

#     return word.lower().count(letter.lower())

# Create an agent with tools and a custom system prompt
system_prompt = os.getenv("ATHENA_SYSTEM_PROMPT")

agent = Agent(
    system_prompt=system_prompt,
)

# Ask the agent a question that uses the available tools
message = """
Hey I'm a complete beginner, how do I become a data scientist?
"""
agent(message)