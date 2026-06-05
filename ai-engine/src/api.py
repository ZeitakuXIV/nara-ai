import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

# Add source directory to sys.path so relative imports in scripts work
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
sys.path.append(current_dir)

from src.parsing.recommendation_engine import NaraRecommender

app = FastAPI(
    title="Nara AI Recommendation Engine API",
    description="Microservice providing real-time nutrition and recipe recommendations for Nara AI.",
    version="1.0.0"
)

# Enable CORS for standard web and frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = None

@app.on_event("startup")
def startup_event():
    global recommender
    recommender = NaraRecommender()

class RecommendationRequest(BaseModel):
    weight_kg: float = Field(..., description="Weight of the user in kilograms")
    height_cm: float = Field(..., description="Height of the user in centimeters")
    age_years: int = Field(..., description="Age of the user in years")
    sex: str = Field(..., description="Sex of the user: 'male' or 'female'")
    activity_level: str = Field(..., description="Activity level: 'sedentary', 'light', 'moderate', 'very_active', etc.")
    goal: str = Field(..., description="Goal: 'weight_loss', 'muscle_gain', 'maintenance', etc.")
    province: str = Field(..., description="Province of the user (Indonesian province name)")
    allergies: Optional[List[str]] = Field(default_factory=list)
    clinical_conditions: Optional[List[str]] = Field(default_factory=list)

@app.post("/recommend")
def recommend(request: RecommendationRequest):
    if recommender is None:
        raise HTTPException(status_code=503, detail="Recommendation engine is not initialized yet.")
    try:
        profile = request.dict()
        result = recommender.recommend(profile)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation computation failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "engine_ready": recommender is not None}
