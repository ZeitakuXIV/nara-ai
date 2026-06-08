/**
 * N.A.R.A Core Nutrition Utility (Medical & Scientific Logic)
 * Implements the Mifflin-St Jeor Equation for BMR and standard TDEE multipliers.
 */

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  extra: 1.9,         // was 1.725, aligned with Python engine
  extra_active: 1.9,  // alias used by Python engine
};

export function calculateBMI(weight: number, heightCm: number): number {
  if (!heightCm || !weight) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

export function getBmiStatus(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', color: 'text-nara-emerald' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
  return { label: 'Obese', color: 'text-red-500' };
}

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor Equation.
 */
export function calculateBMR(weight: number, heightCm: number, age: number, gender: 'male' | 'female' | null): number {
  if (!weight || !heightCm || !age || !gender) return 0;
  
  let bmr = (10 * weight) + (6.25 * heightCm) - (5 * age);
  bmr += gender === 'male' ? 5 : -161;
  return Math.round(bmr);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 */
export function calculateTDEE(bmr: number, activity: string | null): number {
  if (!bmr || !activity) return 0;
  const multiplier = ACTIVITY_MULTIPLIERS[activity] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Generates Target Macros (Protein, Carbs, Fat) based on TDEE and User Goal.
 * Applies Stepped Deficit, Gradual Underweight Surplus, and NARA Ethical Guardrails.
 */
export function calculateTargetMacros(tdee: number, goal: string | null, bmi: number = 22, bmr: number = 1500) {
  let targetCalories = tdee;

  // Goal adjustment to match backend AI mapping
  const normalizedGoal = goal?.toLowerCase().trim() || 'maintenance';
  
  if (normalizedGoal === 'cutting' || normalizedGoal === 'weight_loss') {
    if (bmi < 25.0) {
      targetCalories -= 375; // Gentle deficit
    } else if (bmi <= 35.0) {
      targetCalories -= (tdee * 0.15); // 15% deficit
    } else {
      targetCalories -= (tdee * 0.20); // 20% deficit
    }
  } else if (normalizedGoal === 'bulking' || normalizedGoal === 'muscle_gain') {
    // GRADUAL SURPLUS FOR UNDERWEIGHT
    if (bmi < 17.0) {
      targetCalories += 250; // Small surplus to prevent Refeeding Syndrome
    } else {
      targetCalories += 400; // Standard surplus
    }
  }

  // Prevent dangerously low calories (Ethical Guardrail) - never below BMR for extreme, absolute min 1200
  if (normalizedGoal === 'cutting' || normalizedGoal === 'weight_loss') {
      targetCalories = Math.max(targetCalories, bmr, 1200);
  } else {
      targetCalories = Math.max(targetCalories, 1200);
  }

  // Standard Macronutrient Distribution: 30% Protein, 40% Carbs, 30% Fat
  // Protein: 4 kcal/g | Carbs: 4 kcal/g | Fat: 9 kcal/g
  const proteinGrams = Math.round((targetCalories * 0.30) / 4);
  const carbsGrams = Math.round((targetCalories * 0.40) / 4);
  const fatGrams = Math.round((targetCalories * 0.30) / 9);

  return {
    calories: Math.round(targetCalories),
    protein: proteinGrams,
    carbs: carbsGrams,
    fat: fatGrams,
  };
}
