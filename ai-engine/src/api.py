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

# Stateful in-memory dictionary to store computed meal plans
meal_plans = {}

@app.on_event("startup")
def startup_event():
    global recommender
    recommender = NaraRecommender()

class RecommendationRequest(BaseModel):
    user_id: Optional[str] = Field(default="default", description="Unique identifier for the user or session")
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
        # Exclude user_id before calling the recommender engine if needed, or pass it directly
        result = recommender.recommend(profile)
        
        # Save computed schedule on success for chatbot retrieval context
        if result.get("status") == "success":
            meal_plans[request.user_id] = result
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation computation failed: {str(e)}")

@app.get("/plan/{user_id}")
def get_user_plan(user_id: str):
    if user_id not in meal_plans:
        raise HTTPException(
            status_code=404, 
            detail=f"No active meal plan found for user: {user_id}. Run /recommend first."
        )
    return meal_plans[user_id]

@app.get("/health")
def health_check():
    return {"status": "healthy", "engine_ready": recommender is not None}
