from pydantic import BaseModel
from typing import List, Optional

class StartSessionRequest(BaseModel):
    username: str
    exercises: List[str]  # e.g., ['Leg Squats', 'Neck Rotations']

class SessionSummary(BaseModel):
    username: str
    session_duration: str
    summary: dict
