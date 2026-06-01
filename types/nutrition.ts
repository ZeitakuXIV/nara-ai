export interface UserProfile {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: 'male' | 'female';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  goal: 'weight_loss' | 'maintenance' | 'muscle_gain';
  allergies: string[];
  province: string;
  clinical_conditions: string[];
}

export interface NutritionTargets {
  daily_caloric_needs: number;
  caloric_target_meal: number;
  protein_target_meal: number;
  fat_target_meal: number;
  carbohydrates_target_meal: number;
}

export interface MealRecommendation {
  title: string;
  score: number;
  food_category: 'poultry' | 'red_meat' | 'fish_seafood' | 'plant_based' | 'starch';
  portion_scale_factor: number;
  calories_per_serving: number;
  protein_per_serving: number;
  fat_per_serving: number;
  carbs_per_serving: number;
  density: number;
  regional_alignment_score: number;
  source: string;
  explanations: string[];
  day?: string;
}

export interface RecommendationResponse {
  status: 'success';
  elapsed_ms: number;
  targets: NutritionTargets;
  recipes_filtered_out_allergens: number;
  recipes_scored_realtime: number;
  province_aligned: string;
  primary_schedule: MealRecommendation[];
  alternative_pool: MealRecommendation[];
}

export interface SafetyCutoffResponse {
  status: 'safety_cutoff_triggered';
  clinical_condition_triggered: string;
  medical_disclaimer_id: string;
  medical_disclaimer_en: string;
}

export type APIRecommendationResponse = RecommendationResponse | SafetyCutoffResponse;
