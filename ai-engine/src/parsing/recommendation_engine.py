"""
recommendation_engine.py — Dynamic Recommendation Engine POC (High-Performance).
Calculates dynamic nutritional goals (BMR/TDEE), filters out user allergens,
and scores 16,000+ recipes in real-time under 10 milliseconds.
"""

import os
import json
import time
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RECIPE_CSV = os.path.join(BASE_DIR, "datasets/master/master_recipe_database.csv")
ALLERGEN_CSV = os.path.join(BASE_DIR, "datasets/master/master_allergen_dictionary.csv")

# ──────────────────────────────────────────────
# 1. Dynamic Calorie & Macro Target Calculator
# ──────────────────────────────────────────────

def calculate_user_targets(weight_kg: float, height_cm: float, age_years: int, sex: str, activity_level: str, goal: str) -> dict:
    """
    Calculates BMR via Mifflin-St Jeor, maps activity multipliers to TDEE,
    and applies calorie targets and macro distributions based on goals.
    """
    # Basal Metabolic Rate (BMR)
    if sex.lower() == 'male':
        bmr = 10.0 * weight_kg + 6.25 * height_cm - 5.0 * age_years + 5.0
    else:
        bmr = 10.0 * weight_kg + 6.25 * height_cm - 5.0 * age_years - 161.0
        
    # Activity Multipliers
    multipliers = {
        'sedentary': 1.2,
        'lightly_active': 1.375,
        'moderately_active': 1.55,
        'very_active': 1.725,
        'extra_active': 1.9
    }
    activity_factor = multipliers.get(activity_level.lower(), 1.2)
    tdee = bmr * activity_factor
    
    # Calorie Target based on Goals
    if goal.lower() == 'weight_loss':
        cal_target = tdee - 500.0  # standard 500 kcal deficit
        # Macro splits: 30% Protein, 30% Fat, 40% Carbs
        protein_pct, fat_pct, carb_pct = 0.30, 0.30, 0.40
    elif goal.lower() == 'muscle_gain':
        cal_target = tdee + 400.0  # surplus for lean mass gain
        # Macro splits: 35% Protein, 25% Fat, 40% Carbs
        protein_pct, fat_pct, carb_pct = 0.35, 0.25, 0.40
    else:  # weight maintenance
        cal_target = tdee
        # Standard balanced split: 20% Protein, 30% Fat, 50% Carbs
        protein_pct, fat_pct, carb_pct = 0.20, 0.30, 0.50
        
    # Translate target calories to gram targets (P: 4 kcal/g, F: 9 kcal/g, C: 4 kcal/g)
    protein_g = (cal_target * protein_pct) / 4.0
    fat_g = (cal_target * fat_pct) / 9.0
    carb_g = (cal_target * carb_pct) / 4.0
    
    # Estimate targets per meal (assuming 3 meals + 1 snack, dividing by 3.5)
    return {
        "bmr": round(bmr, 1),
        "tdee": round(tdee, 1),
        "caloric_target_daily": round(cal_target, 1),
        "caloric_target_meal": round(cal_target / 3.5, 1),
        "protein_target_meal": round(protein_g / 3.5, 1),
        "fat_target_meal": round(fat_g / 3.5, 1),
        "carbohydrates_target_meal": round(carb_g / 3.5, 1)
    }

# ──────────────────────────────────────────────
# 2. Dynamic Real-time Recommender Engine
# ──────────────────────────────────────────────

class NaraRecommender:
    def __init__(self):
        print("📂 NaraRecommender: Loading master recipe database ...")
        self.df = pd.read_csv(RECIPE_CSV)
        self.allergen_df = pd.read_csv(ALLERGEN_CSV)
        
        # Build allergen maps (ingredient ➜ set of triggered allergies)
        self.allergen_map = {}
        for _, r in self.allergen_df.iterrows():
            ing = str(r['ingredient']).lower().strip()
            allergies = str(r['allergens']).lower().strip().split(', ')
            self.allergen_map[ing] = set(allergies)
            
        # Pre-parse structured ingredients to avoid JSON parsing in the query loop
        print("⚡ Pre-parsing recipe ingredients for high-speed queries ...")
        self.parsed_ingredients = []
        for raw_struct in self.df['structured_ingredients']:
            try:
                self.parsed_ingredients.append(json.loads(raw_struct))
            except:
                self.parsed_ingredients.append([])
                
        print(f"✅ NaraRecommender: Loaded {len(self.df):,} recipes and {len(self.allergen_map):,} allergen ingredient mappings.")

    def recommend(self, user_profile: dict, limit: int = 5) -> list:
        start_time = time.perf_counter()
        
        # 1. Calculate calorie & macro targets
        targets = calculate_user_targets(
            weight_kg=user_profile["weight_kg"],
            height_cm=user_profile["height_cm"],
            age_years=user_profile["age_years"],
            sex=user_profile["sex"],
            activity_level=user_profile["activity_level"],
            goal=user_profile["goal"]
        )
        
        user_allergies = {a.lower().strip() for a in user_profile.get("allergies", [])}
        
        # 2. Fast Allergen Filter Stage (Pre-parsed List Indexing)
        valid_indices = []
        for idx, ingredients in enumerate(self.parsed_ingredients):
            triggers_allergy = False
            for ing in ingredients:
                item = ing.get('item', '').lower().strip()
                if item in self.allergen_map:
                    triggered_groups = self.allergen_map[item]
                    if triggered_groups & user_allergies:
                        triggers_allergy = True
                        break
            if not triggers_allergy:
                valid_indices.append(idx)
                
        filtered_df = self.df.iloc[valid_indices].copy()
        n_filtered = len(self.df) - len(filtered_df)
        
        # 3. Dynamic Nutrition Scoring Stage (NumPy Matrix Operations)
        t_cal = targets["caloric_target_meal"]
        t_prot = targets["protein_target_meal"]
        t_fat = targets["fat_target_meal"]
        t_carb = targets["carbohydrates_target_meal"]
        
        recipe_cal = filtered_df["Recipe Caloric Value"].values * 3.0
        recipe_prot = filtered_df["Recipe Protein"].values * 3.0
        recipe_fat = filtered_df["Recipe Fat"].values * 3.0
        recipe_carb = filtered_df["Recipe Carbohydrates"].values * 3.0
        recipe_density = filtered_df["Recipe Nutrition Density"].values
        
        # A. Calorie proximity score
        cal_score = np.exp(- np.square((recipe_cal - t_cal) / max(t_cal, 1.0)))
        
        # B. Macro balance score
        prot_diff = np.abs(recipe_prot - t_prot) / max(t_prot, 1.0)
        fat_diff = np.abs(recipe_fat - t_fat) / max(t_fat, 1.0)
        carb_diff = np.abs(recipe_carb - t_carb) / max(t_carb, 1.0)
        macro_score = 1.0 / (1.0 + prot_diff + fat_diff + carb_diff)
        
        # C. Combined Expert Score
        final_scores = 0.40 * cal_score + 0.30 * macro_score + 0.30 * (recipe_density / np.max(recipe_density + 1e-5))
        
        filtered_df["recommendation_score"] = final_scores
        
        # Sort and take top N
        recommendations = filtered_df.sort_values(by="recommendation_score", ascending=False).head(limit)
        
        # Format results
        output = []
        for i, (_, r) in enumerate(recommendations.iterrows()):
            output.append({
                "rank": i + 1,
                "title": r["title"],
                "score": round(r["recommendation_score"] * 100, 1),
                "calories_per_serving": round(r["Recipe Caloric Value"] * 3.0, 1),
                "protein_per_serving": round(r["Recipe Protein"] * 3.0, 1),
                "fat_per_serving": round(r["Recipe Fat"] * 3.0, 1),
                "carbs_per_serving": round(r["Recipe Carbohydrates"] * 3.0, 1),
                "density": r["Recipe Nutrition Density"],
                "source": r["source"]
            })
            
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        
        return {
            "elapsed_ms": round(elapsed_ms, 2),
            "targets": targets,
            "recipes_filtered_out_allergens": n_filtered,
            "recipes_scored_realtime": len(filtered_df),
            "recommendations": output
        }

# ──────────────────────────────────────────────
# Demo Run
# ──────────────────────────────────────────────

def run_demo():
    print("🚀 NARA AI-ENGINE: Starting Dynamic Recommendation Engine Demo ...\n")
    engine = NaraRecommender()
    
    # ── User Profile 1: Weight Loss + Gluten Allergy ──
    user1 = {
        "weight_kg": 70.0,
        "height_cm": 172.0,
        "age_years": 24,
        "sex": "female",
        "activity_level": "moderately_active",
        "goal": "weight_loss",
        "allergies": ["gluten allergy"]
    }
    
    print("\n-------------------------------------------------------")
    print("👤 USER PROFILE 1: Weight Loss (Active) + Gluten Allergy")
    print("-------------------------------------------------------")
    res1 = engine.recommend(user1, limit=3)
    print(f"📊 Calculated targets per meal: {res1['targets']['caloric_target_meal']} kcal | "
          f"P: {res1['targets']['protein_target_meal']}g | F: {res1['targets']['fat_target_meal']}g | C: {res1['targets']['carbohydrates_target_meal']}g")
    print(f"🛡️  Allergen guard filtered out: {res1['recipes_filtered_out_allergens']} recipes containing gluten.")
    print(f"⚡ Real-time scoring speed   : {res1['elapsed_ms']} milliseconds! (Scored {res1['recipes_scored_realtime']} recipes)")
    print("\n🏆 Top 3 Recommended Meals:")
    for rec in res1["recommendations"]:
        print(f"  {rec['rank']}. {rec['title']} (Score: {rec['score']}%)\n"
              f"     Calories: {rec['calories_per_serving']} kcal | P: {rec['protein_per_serving']}g | F: {rec['fat_per_serving']}g | C: {rec['carbs_per_serving']}g\n"
              f"     Source  : {rec['source']} | Nutrition Density: {rec['density']}\n")
              
    # ── User Profile 2: Muscle Gain + Nut Allergy ──
    user2 = {
        "weight_kg": 82.0,
        "height_cm": 180.0,
        "age_years": 28,
        "sex": "male",
        "activity_level": "very_active",
        "goal": "muscle_gain",
        "allergies": ["nut allergy"]
    }
    
    print("\n-------------------------------------------------------")
    print("👤 USER PROFILE 2: Muscle Gain (Athletic) + Nut Allergy")
    print("-------------------------------------------------------")
    res2 = engine.recommend(user2, limit=3)
    print(f"📊 Calculated targets per meal: {res2['targets']['caloric_target_meal']} kcal | "
          f"P: {res2['targets']['protein_target_meal']}g | F: {res2['targets']['fat_target_meal']}g | C: {res2['targets']['carbohydrates_target_meal']}g")
    print(f"🛡️  Allergen guard filtered out: {res2['recipes_filtered_out_allergens']} recipes containing nuts.")
    print(f"⚡ Real-time scoring speed   : {res2['elapsed_ms']} milliseconds! (Scored {res2['recipes_scored_realtime']} recipes)")
    print("\n🏆 Top 3 Recommended Meals:")
    for rec in res2["recommendations"]:
        print(f"  {rec['rank']}. {rec['title']} (Score: {rec['score']}%)\n"
              f"     Calories: {rec['calories_per_serving']} kcal | P: {rec['protein_per_serving']}g | F: {rec['fat_per_serving']}g | C: {rec['carbs_per_serving']}g\n"
              f"     Source  : {rec['source']} | Nutrition Density: {rec['density']}\n")

if __name__ == "__main__":
    run_demo()
