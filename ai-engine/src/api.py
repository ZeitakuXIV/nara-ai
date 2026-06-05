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

# File-based JSON storage to persist meal plans across restarts
MEAL_PLANS_FILE = os.path.join(current_dir, "meal_plans.json")

def load_meal_plans():
    if os.path.exists(MEAL_PLANS_FILE):
        try:
            with open(MEAL_PLANS_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading meal plans: {e}")
            return {}
    return {}

def save_meal_plans(plans):
    try:
        with open(MEAL_PLANS_FILE, "w") as f:
            json.dump(plans, f)
    except Exception as e:
        print(f"Error saving meal plans: {e}")

meal_plans = load_meal_plans()

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
        result = recommender.recommend(profile)
        
        # Save computed schedule on success for chatbot retrieval context
        if result.get("status") == "success":
            meal_plans[request.user_id] = result
            save_meal_plans(meal_plans)
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation computation failed: {str(e)}")

@app.get("/plan/{user_id}")
def get_user_plan(user_id: str):
    # If the exact user_id is not found, fallback to "default_user", "default", or any active plan
    if user_id not in meal_plans:
        if (user_id == "user_id" or user_id == "default") and "default_user" in meal_plans:
            return meal_plans["default_user"]
        
        # Fallback to the first available plan if anyone has onboarded
        if meal_plans:
            return next(iter(meal_plans.values()))
            
        raise HTTPException(
            status_code=404, 
            detail=f"No active meal plan found for user: {user_id}. Run /recommend first."
        )
    return meal_plans[user_id]

@app.get("/health")
def health_check():
    return {"status": "healthy", "engine_ready": recommender is not None}
