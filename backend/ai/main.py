from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from fastapi import HTTPException
from typing import Literal

app = FastAPI()

# --- Models ---
class Lead(BaseModel):
    lead_id: int
    name: str

class RequestBody(BaseModel):
    org_id: int
    leads: List[Lead]

class GenericRequest(BaseModel):
    type: Literal["outreach", "summarize"]
    prompt: Optional[str] = None

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "AI Service Running"}

@app.post("/recommend")
def recommend(body: RequestBody):
    # Simple example logic (not ML)
    results = []
    for lead in body.leads:
        score = (lead.lead_id % 100) / 100
        results.append({"lead_id": lead.lead_id, "score": score})

    return {"lead_scores": results}

@app.post("/")
def handle_generic_request(body: GenericRequest):
    """
    Handles outreach and summarization requests from aiEmailService.js
    which posts to the root URL.
    """

    if not body.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    if body.type == "outreach":
        # Mock outreach generation
        return {
            "output": f"Subject: Collaboration Opportunity\n\nHi there,\n\nI noticed your work and wanted to connect. Let's chat!\n\n(Generated based on prompt: {body.prompt})"
        }
    
    elif body.type == "summarize":
        # Mock summarization
        return {
            "output": f"Here is a summary of the content: It discusses key points about efficiency and integration. (Generated based on prompt: {body.prompt})"
        }
    
    raise HTTPException(status_code=400, detail="Unknown request type")
