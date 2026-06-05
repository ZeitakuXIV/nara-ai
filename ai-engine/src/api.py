import sys
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Add source directory to sys.path so relative imports in scripts work
current_dir = os.path.dirname(os.path.abspath(__file__)) # ai-engine/src
parent_dir = os.path.dirname(current_dir) # ai-engine
root_dir = os.path.dirname(parent_dir) # project root

sys.path.append(parent_dir)
sys.path.append(current_dir)

# Load environment variables from .env or .env.local in the root directory
load_dotenv(os.path.join(root_dir, ".env.local"))
load_dotenv(os.path.join(root_dir, ".env"))

# Billing synchronization for Gemini Enterprise Agent Platform
if "GOOGLE_CLOUD_PROJECT" in os.environ:
    os.environ["PROJECT_ID"] = os.environ["GOOGLE_CLOUD_PROJECT"]

from src.parsing.recommendation_engine import NaraRecommender
from src.nara_agent import root_agent
try:
    from src.schemas import RecommendationRequest, ChatRequest
except ModuleNotFoundError:
    from schemas import RecommendationRequest, ChatRequest
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.genai import types
import asyncio

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
agent_runner = None
session_service = None

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
async def startup_event():
    global recommender, agent_runner, session_service
    recommender = NaraRecommender()
    
    # Persistent SQLite session storage — survives request cycles within a deployment
    # Note: Railway has ephemeral filesystem, so sessions reset on full redeploy.
    # For cross-deployment persistence, swap db_url to a PostgreSQL connection string.
    session_service = DatabaseSessionService(db_url="sqlite:///./nara_sessions.db")
    
    agent_runner = Runner(
        agent=root_agent,
        session_service=session_service,
        app_name="nara_ai"
    )

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

def format_meal_plan_for_agent(meal_plan) -> str:
    """
    Formats the meal plan (list of Recipe dicts from Supabase/Zustand)
    into a clean readable list for the agent's context window.
    No biometric data is included — ethical decision.
    """
    if not meal_plan:
        return ""
    
    if isinstance(meal_plan, list):
        lines = []
        for i, recipe in enumerate(meal_plan[:20]):  # Cap at 20 recipes to avoid token bloat
            if isinstance(recipe, dict):
                name = recipe.get("title") or recipe.get("name") or "Unknown Recipe"
                cals = recipe.get("calories", "?")
                lines.append(f"  {i+1}. {name} (~{cals} kcal)")
            elif isinstance(recipe, str):
                lines.append(f"  {i+1}. {recipe}")
        return "\n".join(lines) if lines else ""
    
    # Fallback: already a string or dict with days
    return json.dumps(meal_plan, ensure_ascii=False)

@app.post("/chat")
async def chat(request: ChatRequest):
    if agent_runner is None:
        raise HTTPException(status_code=503, detail="Agent runner is not initialized yet.")
    try:
        # 1. Get meal plan from context (fetched from Supabase by Next.js route, or client-side fallback)
        # No biometric data is injected — ethical decision to keep personal health data off the agent
        meal_plan = None
        if request.context:
            meal_plan = request.context.get("mealPlan")
        
        # 2. Build pre-prompt context with ONLY meal plan (no biometrics)
        user_message = request.message
        context_parts = []
        
        if meal_plan:
            meal_plan_str = format_meal_plan_for_agent(meal_plan)
            if meal_plan_str:
                context_parts.append(f"MEAL PLAN CURRENTLY ASSIGNED TO THIS USER:\n{meal_plan_str}")
        
        if context_parts:
            full_context = "\n\n".join(context_parts)
            user_message = f"--- CONTEXT START ---\n{full_context}\n--- CONTEXT END ---\n\nUser Question: {user_message}"
        
        print(f"--- NARA CHAT REQUEST ---\nMessage: {user_message}\n------------------------")
        
        # Consistent identifiers using dynamic user_id
        APP_NAME = "nara_ai"
        user_id = request.user_id or "default_user"
        session_id = f"session_{user_id}"

        # Ensure session exists in the service
        # Ensure session exists in the service
        session = await session_service.get_session(user_id=user_id, session_id=session_id, app_name=APP_NAME)
        if not session:
            print(f"Creating session for user {user_id}: {session_id}")
            await session_service.create_session(user_id=user_id, session_id=session_id, app_name=APP_NAME)
        
        # Prepare content object
        msg_content = types.Content(
            role="user",
            parts=[types.Part(text=user_message)]
        )
        
        # Run the agent
        events = agent_runner.run(
            user_id=user_id,
            session_id=session_id,
            new_message=msg_content
        )
        
        ai_text = ""
        for event in events:
            # Check for content in parts
            if hasattr(event, 'content') and event.content and event.content.parts:
                ai_text = event.content.parts[0].text
            # Final response check
            if hasattr(event, 'is_final_response') and event.is_final_response():
                if hasattr(event, 'content') and event.content:
                    ai_text = event.content.parts[0].text
                break
        
        if not ai_text:
            ai_text = "Maaf, NARA sedang memproses informasi. Silakan tanya kembali dalam sekejap."

        print(f"--- NARA RESPONSE SUCCESS ---")
        return {
            "success": True,
            "response": ai_text,
            "isXAI": True 
        }
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"--- NARA CHAT ERROR ---\n{error_detail}\n----------------------")
        raise HTTPException(status_code=500, detail=f"Chat agent failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "engine_ready": recommender is not None}

