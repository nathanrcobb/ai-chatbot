import os

from dotenv import load_dotenv
import openai
from fastapi import FastAPI, Form, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from typing import Annotated

# Load environment variables
load_dotenv()
access_token = os.getenv("OPENAI_API_KEY", "")
if not access_token:
    raise KeyError("OPENAI_API_KEY not found in environment.")
openai.api_key = access_token

# FastAPI app
app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Log of all user, system, and assistant prompts
chat_log = [{"role": "system", "content": "You are a helpful assistant"}]

# Temporary, for testing
chat_log.append(
    {"role": "user", "content": "What was the most popular Christmas gift in 1989?"}
)
chat_log.append(
    {
        "role": "assistant",
        "content": 'In 1989, one of the most popular and highly sought-after toys for Christmas was the "Game Boy" by Nintendo. The Game Boy was a handheld gaming console that allowed players to enjoy video games on the go. It came with games like "Tetris," which quickly became a hit and contributed to the Game Boy\'s immense popularity during the holiday season in 1989.',
    }
)


@app.get("/", response_class=HTMLResponse)
async def chat_page(request: Request):
    return templates.TemplateResponse(
        "home.html", {"request": request, "chat_log": chat_log}
    )


@app.post("/", response_class=HTMLResponse)
async def chat(request: Request, user_input: Annotated[str, Form()]):
    # Append user input to chat log
    chat_log.append({"role": "user", "content": user_input})

    # Make call to OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=chat_log,
        temperature=0.8,
    )

    # Get response from OpenAI API
    bot_response = response.get("choices", [])[0].get("message").get("content")

    # Append assistant response to chat log
    chat_log.append({"role": "assistant", "content": bot_response})

    return templates.TemplateResponse(
        "home.html", {"request": request, "chat_log": chat_log}
    )
