import os

from dotenv import load_dotenv
import openai
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables
load_dotenv()
access_token = os.getenv("OPENAI_API_KEY", "")
if not access_token:
    raise KeyError("OPENAI_API_KEY not found in environment.")
openai.api_key = access_token

# FastAPI app
app = FastAPI()

origins = [
    "http://localhost:8000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)


# Log of all user, system, and assistant prompts
app.chat_log = [{"role": "system", "content": "You are a helpful assistant"}]

# Canned chat log for testing purposes, to pad the chat history
# app.chat_log.append({
#     "role": "user",
#     "content": "What was the most popular Christmas gift in 1992?"
# })
# app.chat_log.append({
#     "role": "assistant",
#     "content": "In 1992, one of the most popular Christmas gifts was the Super Nintendo Entertainment System (SNES). This gaming console was highly sought after and came with popular games like Super Mario World and The Legend of Zelda: A Link to the Past."
# })
# app.chat_log.append({
#     "role": "user",
#     "content": "What about the second?"
# })
# app.chat_log.append({
#     "role": "assistant",
#     "content": "The second most popular Christmas gift in 1992 was the Talkboy, which gained immense popularity due to its appearance in the movie Home Alone 2: Lost in New York. The Talkboy was a handheld cassette recorder and player that allowed users to record and modify their voices. Its inclusion in the movie led to a surge in demand and made it a sought-after gift during that holiday season."
# })
# app.chat_log.append({
#     "role": "user",
#     "content": "What year did the first movie in that franchise come out?"
# })
# app.chat_log.append({
#     "role": "assistant",
#     "content": "The first movie in the Home Alone franchise, simply titled Home Alone, was released in 1990. It was directed by Chris Columbus and starred Macaulay Culkin as Kevin McCallister, a young boy who is accidentally left behind when his family goes on vacation during Christmas. The film became a massive success and remains a beloved holiday classic."
# })
# app.chat_log.append({
#     "role": "user",
#     "content": "What day was that released in theaters?"
# })
# app.chat_log.append({
#     "role": "assistant",
#     "content": "Home Alone was released in theaters on November 16, 1990."
# })


class UserInputIn(BaseModel):
    prompt: str


@app.get("/")
async def get_chat_logs():
    return JSONResponse(content=app.chat_log)


@app.post("/")
async def chat(request: Request, user_input: UserInputIn):
    # Append user input to chat log
    app.chat_log.append({"role": "user", "content": user_input.prompt})

    # Make call to OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=app.chat_log,
        temperature=0.8,
        max_tokens=500
    )

    # Get response from OpenAI API
    bot_response = response.get("choices", [])[0].get("message").get("content")

    # Append assistant response to chat log
    app.chat_log.append({"role": "assistant", "content": bot_response})

    return JSONResponse(content=app.chat_log)

@app.delete("/")
async def clear_chat_log():
    # Re-initialize the chat log
    app.chat_log = [{"role": "system", "content": "You are a helpful assistant"}]

    return JSONResponse(content=app.chat_log)
