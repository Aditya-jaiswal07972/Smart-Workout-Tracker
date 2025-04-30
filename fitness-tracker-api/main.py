from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Dict, Any
import json
import os

app = FastAPI()

DATA_FILE = "exercise_data.json"
templates = Jinja2Templates(directory="templates")

# ---------------------- Data Handling ----------------------

class SessionData(BaseModel):
    username: str
    summary: Dict[str, Any]

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {}

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

# ---------------------- API Routes -------------------------

@app.post("/start_session")
async def start_session(data: SessionData):
    all_data = load_data()
    all_data.setdefault(data.username, []).append(data.summary)
    save_data(all_data)
    return {"message": f"Session saved for {data.username}.", "summary": data.summary}

@app.get("/user_sessions/{username}")
def get_user_sessions(username: str):
    all_data = load_data()
    user_sessions = all_data.get(username, [])
    return {"username": username, "sessions": user_sessions}

@app.get("/dashboard/{username}", response_class=HTMLResponse)
def personal_dashboard(request: Request, username: str):
    all_data = load_data()
    user_sessions = all_data.get(username, [])
    return templates.TemplateResponse("user_dashboard.html", {
        "request": request,
        "username": username,
        "sessions": user_sessions
    })
