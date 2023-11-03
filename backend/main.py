import os

production = False
try:
    import uvicorn
except ImportError:
    production = True

from dotenv import load_dotenv
import openai
from fastapi import FastAPI, HTTPException, Request, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader, APIKeyQuery
from pydantic import BaseModel
from mangum import Mangum

# Load environment variables, if in dev env
# if not production:
load_dotenv()
access_token = os.getenv("OPENAI_API_KEY", "")
if not access_token:
    raise KeyError("OPENAI_API_KEY not found in environment.")
openai.api_key = access_token

api_key = os.getenv("ACCEPTED_API_KEY", "")
if not api_key:
    raise KeyError("ACCEPTED_API_KEY not found in environment.")

EXCLUDED_CHATS = ["image", "info"]
INITIAL_CHATLOG = [
    {"role": "system", "content": "You are a helpful assistant"},
    {
        "role": "info",
        "content": (
            "Hello!\n\nI'm a personal assistant chatbot. I will respond as"
            " best I can to any messages you send me.\n\nI can also generate"
            " images based on a prompt you send using '/image ' followed by"
            " the prompt.\n\nHow may I assist you today?"
        ),
    },
]

# FastAPI app
app = FastAPI()

# Create handler for AWS
handler = Mangum(app)

origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "https://ai-chatbot-git-main-nathanrcobb.vercel.app",
    "https://ai-chatbot-five-bice.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "DELETE"],
    allow_headers=["*"],
    max_age=3600,
)

api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)


# Log of all user, system, and assistant prompts
chat_log = list(INITIAL_CHATLOG)

# Canned chat log for testing purposes, to pad the chat history
# chat_log.append(
#     {
#         "role": "user",
#         "content": "What was the most popular Christmas gift in 1992?",
#     }
# )
# chat_log.append(
#     {
#         "role": "assistant",
#         "content": (
#             "In 1992, one of the most popular Christmas gifts was the Super"
#             " Nintendo Entertainment System (SNES). This gaming console was"
#             " highly sought after and came with popular games like Super Mario"
#             " World and The Legend of Zelda: A Link to the Past."
#         ),
#     }
# )
# chat_log.append({"role": "user", "content": "What about the second?"})
# chat_log.append(
#     {
#         "role": "assistant",
#         "content": (
#             "The second most popular Christmas gift in 1992 was the Talkboy,"
#             " which gained immense popularity due to its appearance in the"
#             " movie Home Alone 2: Lost in New York. The Talkboy was a handheld"
#             " cassette recorder and player that allowed users to record and"
#             " modify their voices. Its inclusion in the movie led to a surge"
#             " in demand and made it a sought-after gift during that holiday"
#             " season."
#         ),
#     }
# )
# chat_log.append(
#     {
#         "role": "user",
#         "content": "What year did the first movie in that franchise come out?",
#     }
# )
# chat_log.append(
#     {
#         "role": "assistant",
#         "content": (
#             "The first movie in the Home Alone franchise, simply titled Home"
#             " Alone, was released in 1990. It was directed by Chris Columbus"
#             " and starred Macaulay Culkin as Kevin McCallister, a young boy"
#             " who is accidentally left behind when his family goes on vacation"
#             " during Christmas. The film became a massive success and remains"
#             " a beloved holiday classic."
#         ),
#     }
# )
# chat_log.append(
#     {"role": "user", "content": "What day was that released in theaters?"}
# )
# chat_log.append(
#     {
#         "role": "assistant",
#         "content": "Home Alone was released in theaters on November 16, 1990.",
#     }
# )


class UserInputIn(BaseModel):
    prompt: str


def get_api_key(
    api_key_header: str = Security(api_key_header),
) -> str:
    if api_key_header == api_key:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API Key",
    )


@app.get("/")
async def get_chat_logs():
    global chat_log

    return chat_log


@app.post("/")
async def chat(
    request: Request,
    user_input: UserInputIn,
    api_key: str = Security(get_api_key),
):
    global chat_log

    # Append user input to chat log
    chat_log.append({"role": "user", "content": user_input.prompt})
    ai_prompts = [
        log_entry
        for log_entry in chat_log
        if not log_entry.get("role") in EXCLUDED_CHATS
    ]

    # Make call to OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=ai_prompts,
        temperature=0.8,
        max_tokens=500,
    )

    # Get response from OpenAI API
    bot_response = response.get("choices", [])[0].get("message").get("content")

    # Append assistant response to chat log
    chat_log.append({"role": "assistant", "content": bot_response})

    return chat_log


@app.post("/i")
async def chat(
    request: Request,
    user_input: UserInputIn,
    api_key: str = Security(get_api_key),
):
    global chat_log

    # Append user input to chat log
    chat_log.append({"role": "user", "content": user_input.prompt})
    chat_log.append(
        {
            "role": "info",
            "content": (
                "Please wait a moment while I generate that image for you..."
            ),
        },
    )

    # Make call to OpenAI API
    response = openai.Image.create(
        prompt=user_input.prompt, n=1, size="512x512"
    )

    # Get response from OpenAI API
    bot_response = response.get("data", [])[0].get("url")

    # Append assistant response to chat log
    chat_log.append({"role": "image", "content": bot_response})

    return bot_response


@app.delete("/")
async def clear_chat_log():
    global chat_log, INITIAL_CHATLOG

    # Re-initialize the chat log
    chat_log = list(INITIAL_CHATLOG)

    return chat_log


if __name__ == "__main__":
    if not production:
        uvicorn.run("main:app", host="127.0.0.1", port=8000)
