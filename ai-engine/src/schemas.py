from pydantic import BaseModel, Field
from typing import List, Optional

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

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user message to NARA")
    user_id: Optional[str] = Field(default="default_user", description="Unique identifier for the user or session")
    context: Optional[dict] = Field(default=None, description="Optional user context (BMI, goals, etc.)")
